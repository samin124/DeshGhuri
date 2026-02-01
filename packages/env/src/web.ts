import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_API_MOCKING_ENABLED: z
      .string()
      .optional()
      .default("false")
      .transform((val) => val === "true"),
  },
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
});
