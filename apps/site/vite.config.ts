import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import presetIcons from "@unocss/preset-icons";
import { lazyPlugins } from "vite-plus";

// https://vite.dev/config/
export default defineConfig({
  plugins: lazyPlugins(() => [
    vue(),
    UnoCSS({
      // vai 以源码形式被 site 引用；图标类名写在 .vm.ts 等逻辑文件里。
      // UnoCSS 默认不扫 .ts/.js，需显式纳入 pipeline，才能生成 ci-* 图标样式。
      content: {
        pipeline: {
          include: [
            /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
            // 扫组件库源码里的静态类名（如 alert.vm.ts 中的 ci-check）
            /([/\\]packages[/\\]vai[/\\]|[/\\]vai[/\\]src[/\\]).*\.(vue|ts|js)($|\?)/,
          ],
        },
      },
      presets: [
        presetIcons({
          prefix: "",
          extraProperties: {
            display: "inline-block",
            "vertical-align": "middle",
          },
          collections: {
            ci: () =>
              import("@opentiny/icons/json/icons.json", {
                with: { type: "json" },
              }).then((i) => i.default),
          },
        }),
      ],
    }),
  ]),
  css: {
    preprocessorOptions: {
      less: {},
    },
  },
  server: {
    fs: {
      allow: ["../.."],
    },
  },
});
