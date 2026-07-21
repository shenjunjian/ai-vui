import { reactive, computed } from "vue";
import type { DividerCtx } from "./divider.vue";

export default function useVm(ctx: DividerCtx) {
  const { props } = ctx;

  const themeClass = computed(() => {
    if (!props.theme) return "st-control";
    const themeMap: Record<string, string> = {
      dark: "st-dark",
      success: "st-success",
      info: "st-info",
      warn: "st-warn",
      error: "st-error",
    };
    return themeMap[props.theme] || "st-control";
  });

  const rootClass = computed(() => [
    themeClass.value,
    {
      "v-vertical-divider": props.vertical,
    },
  ]);

  const lineStyle = computed(() => ({
    "--divider-border-style": props.borderStyle,
  }));

  const state = reactive({
    themeClass,
    rootClass,
    lineStyle,
  });

  const api = {};

  return { state, api };
}
