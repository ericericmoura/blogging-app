import {createTransport } from "nodemailer";
import { env } from "./env";

export const emailTransporter = createTransport({
    host: env.EMAIL_HOST,
    port: 587,
    secure: env.NODE_ENV === "production", // this line uses TLS in production only
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});