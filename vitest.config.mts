/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// getViteConfig reuses Astro's own Vite setup, so the `@*` tsconfig paths
// resolve in tests exactly as they do in the app.
export default getViteConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
