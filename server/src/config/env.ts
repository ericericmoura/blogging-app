import dotenv from "dotenv";
import z from "zod";

const result = dotenv.config();

if (result.error) {
  console.error(`Failed to read contents from .env: ${result.error.message}`);
}

const envSchema = z.object({
  // JWT Config
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_SECRET: z.string()
    .min(32, "JWT_SECRET must be at least 32 characters long")
    .refine(
      (val) => !/^(.)\1+$/.test(val),
      "JWT_SECRET must not be a repeated character"
    )
    .refine(
      (val) => new Set(val).size >= 8,
      "JWT_SECRET has too little variety (looks weak/predictable)"
    )
    .refine(
      (val) => !/^(password|secret|changeme|jwtsecret|test)/i.test(val),
      "JWT_SECRET looks like a placeholder/default value"
    ),

  // DATABASE
  DATABASE_URL: z.url(),

  // SERVER
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  SEED_USER_COUNT: z.coerce.number().int().positive().default(1000),

  // CONSTRAINTS
  MAX_MARKDOWN_SIZE_MB: z.coerce.number().int().positive().default(5),

  // AWS
  BUCKET_NAME: z.string().default("blogging-app"),
  BUCKET_REGION: z.string(),
  SECRET_ACCESS_KEY: z.string(),
  ACCESS_KEY_ID: z.string(),

  // E-MAIL
  EMAIL_HOST: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
});

const parsedEnv = z.safeParse(envSchema, process.env);

if (!parsedEnv.success) {
  const tree = z.treeifyError(parsedEnv.error).properties;
  const issues = Object.entries(tree ?? {}).map((val) => {
    return `\n\t${val[0]} - ${val[1].errors.join(", ")}`;
  });

  console.error(`Failed to load contents from .env: ${issues}`);
  process.exit(1);
}

export const env = parsedEnv.data;
