import { defineConfig } from "vite-plus";

export default defineConfig({
  create: {
    templates: [
      { name: "add-component", description: "增加一个新组件", template: "./scripts/add-component" },
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
