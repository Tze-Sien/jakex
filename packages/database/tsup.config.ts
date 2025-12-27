import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  entry: ["src/index.ts", "src/schema.ts", "src/client.ts"],
  format: ["cjs", "esm"],
  dts: {
    resolve: true, // Faster type resolution
  },
  splitting: false,
  sourcemap: !isProduction, // Skip source maps in production
  clean: true,
  treeshake: isProduction, // Only tree-shake in production
  minify: false, // No minification for library code
  external: ["postgres", "drizzle-orm"],
});
