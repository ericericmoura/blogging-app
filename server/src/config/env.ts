import dotenv from "dotenv";
import z from "zod";

const result = dotenv.config();

if (result.error) {
  console.error(`Failed to read contents from .env: ${result.error.message}`);
}

const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  SEED_USER_COUNT: z.coerce.number().int().positive().default(1000),
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
