import { defineConfig, PluginOption } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import UnoCSS from 'unocss/vite'
import presetIcons from '@unocss/preset-icons'
import { lazyPlugins } from "vite-plus";

// https://vite.dev/config/
export default defineConfig({
  plugins: lazyPlugins(() => [vue(), UnoCSS({
    presets: [
      presetIcons({
        prefix: '',
        extraProperties: {
          display: 'inline-block',
          'vertical-align': 'middle'
        },
        collections: {
          ci: () => import('@opentiny/icons/json/icons.json', { with: { type: 'json' }}).then((i) => i.default)
        }
      })
    ]
  })] as PluginOption[]),
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
