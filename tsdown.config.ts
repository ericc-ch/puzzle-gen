import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/main.ts", "src/cli.ts"],

  target: "esnext",
  platform: "node",

  sourcemap: true,
})
