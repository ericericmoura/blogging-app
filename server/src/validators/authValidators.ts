import z from "zod";
import { strongPasswordSchema } from "./strongPasswordSchema";

export const registerValidator = z.object({
    username: z.string().min(3),
    email: z.email(),
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    password: strongPasswordSchema
})