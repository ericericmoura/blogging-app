import { NextFunction, Response } from "express";
import { ValidatedRequest } from "express-zod-safe";
import { registerValidator } from "../validators/authValidators";
import { prisma } from "../config/database";
import bcrypt from "bcrypt"
import { emailTransporter } from "../config/emailTransporter";
import { Prisma } from "../generated/prisma/client";
import { generateJWT } from "../utils/generateJWT";
import { AppError } from "../classes/AppError";

const userSelect = { id: true, username: true, firstName: true, lastName: true, confirmedEmail: true };

export const register = async (
    req: ValidatedRequest<{ body: typeof registerValidator }>,
    res: Response,
    next: NextFunction
) => {
    const { email, username, firstName, lastName, password } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

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
        if (err instanceof Prisma.PrismaClientKnownRequestError)
        {
            if (err.code == "P2002")
            {
                res.status(409).json({ statusCode: 409, message: "username and/or e-mail already taken." });
                return null;
            }
        }
        throw err;
    });

    if (user === null)
    {
        return next(new AppError("Failed to create user.", 500));
    }

    const token = generateJWT({ id: user.id });

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