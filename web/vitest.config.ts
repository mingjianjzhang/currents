import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // `server-only` throws outside the React server build; it's a no-op in tests.
      "server-only": path.resolve(import.meta.dirname, "test/empty.ts"),
    },
  },
  test: { environment: "node", fileParallelism: false },
});
