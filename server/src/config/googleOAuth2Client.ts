import { OAuth2Client } from "google-auth-library";
import { env } from "./env";

export const googleOAuth2Client = new OAuth2Client({
    clientId: env.CLIENT_ID,
    clientSecret: env.CLIENT_SECRET,
    redirectUri: "http://localhost:3000/api/v1/auth/google-login-callback"
});