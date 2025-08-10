import { z } from "zod";

const envSchema = z.object({
  VITE_APP_VERSION: z.string().min(1),
  VITE_APP_NAME: z.string().min(1),
  VITE_APP_ENVIRONMENT: z.string().min(1),
  VITE_API_URL: z.string().url(),

  // Environment
  NODE_ENV: z
    .enum(["development", "production"])
    .optional()
    .default("production"),

  // PostHog
  VITE_POSTHOG_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  VITE_POSTHOG_API_KEY: z.string().min(1).optional(),
  VITE_POSTHOG_HOST: z.string().url().optional(),
  VITE_POSTHOG_PERSON_PROFILES: z
    .enum(["identified_only", "always"])
    .optional(),

  // Sentry
  VITE_SENTRY_ENABLED: z
    .enum(["true", "false"]) // must be provided explicitly to enable
    .optional()
    .transform((val) => val === "true"),
  VITE_SENTRY_DSN: z.string().min(1).optional(),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z
    .string()
    .optional(),
  VITE_SENTRY_FEEDBACK_ENABLED: z
    .enum(["true", "false"]) // enabled unless explicitly set to false
    .optional()
    .transform((val) => val !== "false"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse({
      ...import.meta.env,
      MODE: import.meta.env.MODE,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        return `${issue.path.join(".")}: ${issue.message}`;
      });
      throw new Error(`Environment validation failed:\n${issues.join("\n")}`);
    }
    throw error;
  }
}

export const env = validateEnv();
