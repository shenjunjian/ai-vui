import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import { lazyPlugins } from "vite-plus";

// https://vite.dev/config/
export default defineConfig({
  plugins: lazyPlugins(() => [vue()]),
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
  css: {
    preprocessorOptions: {
      less: {},
    },
  },
});
