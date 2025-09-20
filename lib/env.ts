import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("streamertools.fun"),
  LOG_LEVEL: z.enum(["silent","error","warn","info","debug","trace"]).default("info"),
})

export type Env = z.infer<typeof envSchema>

let cached: Env | null = null

export function getEnv(): Env {
  if (cached) return cached
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    LOG_LEVEL: process.env.LOG_LEVEL,
  })
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid environment variables", parsed.error.flatten().fieldErrors)
    throw new Error("ENV_VALIDATION_FAILED")
  }
  cached = parsed.data
  return cached
}


