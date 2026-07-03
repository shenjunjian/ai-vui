import { defineConfig } from "vite-plus";

export default defineConfig({
  // 纯 CSS 库：pack 不再需要 dts / exports
  pack: { dts: false },
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {},
});
