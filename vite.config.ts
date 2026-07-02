import { defineConfig } from "vite-plus";

export default defineConfig({
  create: {
    templates: [
      {
        name: "ai-vui-scripts",
        description: "通用的nodejs构建脚本",
        template: "./scripts/ai-vui-scripts",
      },
    ],
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
});
