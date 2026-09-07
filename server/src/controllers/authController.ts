import { Request, NextFunction, Response } from "express";
import { ValidatedRequest } from "express-zod-safe";
import { googleLoginQueryValidator, loginValidator, registerValidator } from "../validators/authValidators";
import { prisma } from "../config/database";
import bcrypt from "bcrypt"
import { emailTransporter } from "../config/emailTransporter";
import { Prisma, Roles } from "../generated/prisma/client";
import { generateJWT } from "../utils/generateJWT";
import { AppError } from "../classes/AppError";
import { hashPassword } from "../utils/hashPassword";
import { googleOAuth2Client } from "../config/googleOAuth2Client";
import { env } from "../config/env";

const userSelect = { id: true, username: true, firstName: true, lastName: true, confirmedEmail: true };

export const googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = googleOAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ]
    });

    res.status(200).json({ authorizeUrl });
}

export const googleLoginCallback = async (
    req: ValidatedRequest<{ query: typeof googleLoginQueryValidator }>,
    res: Response,
    next: NextFunction
) => {
    const { code } = req.query;

    const r = await googleOAuth2Client.getToken(code);
    googleOAuth2Client.setCredentials(r.tokens);

    if (!r.tokens.id_token) {
        return next(new AppError("No id_token returned from Google.", 400));
    }

    const ticket = await googleOAuth2Client.verifyIdToken({
        idToken: r.tokens.id_token,
        audience: env.CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        return next(new AppError("Could not retrieve email from Google.", 400));
    }

    if (!payload.email_verified) {
        return next(new AppError("Google email is not verified.", 403));
    }

    const { email } = payload;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
    {
        return next(new AppError("No user found for that e-mail, register first.", 404));
    }

    if (!user.confirmedEmail)
    {
        await prisma.user.update({where: {email}, data: {confirmedEmail: true}});
    }

    const token = generateJWT({id: user.id, role: user.role});

    res.status(200).json({token});
}

export const register = async (
    req: ValidatedRequest<{ body: typeof registerValidator }>,
    res: Response,
    next: NextFunction
) => {
    const { email, username, firstName, lastName, password } = req.body;

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            username,
            firstName,
            lastName,
            passwordHash,
        },
        select: userSelect
    }).catch(err => {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code == "P2002") {
                res.status(409).json({ statusCode: 409, message: "username and/or e-mail already taken." });
                return null;
            }
        }
        throw err;
    });

    if (user === null) {
        return next(new AppError("Failed to create user.", 500));
    }

    const token = generateJWT({ id: user.id, role: Roles.USER });

    res.status(201).json({ message: "User successfully registered.", data: user, token });

    await emailTransporter.sendMail({
        from: '"Blogging App Support" <no-reply@verify.signin.bloggingapp>',
        to: email,
        subject: "Verifique seu e-mail",
        text: "use esse link para verificar seu e-mail: *link+token*",
        html: "use esse link para verificar seu e-mail: *link+token*",
    }).catch(err => {
        console.error("Failed to send account verification e-mail: ", err);
    })
}

export const login = async (
    req: ValidatedRequest<{ body: typeof loginValidator }>,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUniqueOrThrow({ where: { email } });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            throw null;
        }

        const token = generateJWT({ id: user.id, role: user.role });

        res.status(200).json({ token });
    }
    catch (error) {
        return next(new AppError("Invalid e-mail or password.", 401));
    }

};