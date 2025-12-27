import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts", "src/providers.ts", "src/server.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["@supabase/supabase-js", "@supabase/ssr", "next/headers", "react"],
});
