import { config } from "dotenv";
import { parseEnv, z } from "znv";

config();

export const {
  DEV_ACCESS_TOKEN: ACCESS_TOKEN,
  HEADLESS_MODE,
  ENABLE_EXPONENTIAL_BACKOFF,
  OPENAI_API_KEY,
  OPENAI_MODEL,
} = parseEnv(process.env, {
  DEV_ACCESS_TOKEN: z.string().min(1).optional(),
  HEADLESS_MODE: z.boolean().default(true),
  ENABLE_EXPONENTIAL_BACKOFF: z.boolean().default(false),
  // OpenAI / GPT — used by the birthday research analysis layer.
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
});
