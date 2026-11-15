import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Resolves the @/ and @types path aliases from tsconfig.json
  plugins: [tsconfigPaths()],
  esbuild: {
    // tsconfig.json uses "jsx": "preserve" for Next.js; tests that import .tsx modules need it compiled
    jsx: "automatic",
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
