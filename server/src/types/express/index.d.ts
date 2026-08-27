import { Roles } from "../../generated/prisma/enums";

export interface AuthPayload {
  id: number;
  role: Roles;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}
