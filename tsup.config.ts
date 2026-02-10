import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "vue/index": "src/vue/index.ts",
    "react/index": "src/react/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  minify: true,
  external: ["vue", "react"],
});
