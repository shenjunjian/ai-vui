import { reactive, computed } from "vue";
import type { LinkCtx } from "./link.vue";

export default function useVm(ctx: LinkCtx) {
  const { props } = ctx;

  const sizeClass = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: "st-sm",
      md: "st-md",
      lg: "st-lg",
    };
    return sizeMap[props.size] || "st-md";
  });

  const themeClass = computed(() => {
    if (!props.theme) return "";
    const themeMap: Record<string, string> = {
      dark: "st-dark",
      success: "st-success",
      info: "st-info",
      warn: "st-warn",
      error: "st-error",
    };
    return themeMap[props.theme] || "";
  });

  const underlineClass = computed(() => {
    const underlineMap: Record<string, string> = {
      none: "sc-underline-none",
      hover: "sc-underline-hover",
      always: "sc-underline-always",
    };
    return underlineMap[props.underline] || "sc-underline-hover";
  });

  const rootClass = computed(() => [
    sizeClass.value,
    themeClass.value,
    underlineClass.value,
    {
      "st-disabled": props.disabled,
    },
  ]);

  const state = reactive({
    sizeClass,
    themeClass,
    underlineClass,
    rootClass,
  });

  function handleClick(event: MouseEvent) {
    if (props.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  const api = {
    handleClick,
  };

  return { state, api };
}
