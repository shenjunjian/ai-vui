import { reactive, computed, ref, nextTick } from "vue";
import type { AlertCtx } from "./alert.vue";
import { callWithGuard } from "../../utils/promiseHelper.ts";

export default function useVm(ctx: AlertCtx) {
  const { props, emit } = ctx;

  const visible = ref(true);

  const sizeClass = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: "st-sm",
      md: "st-md",
      lg: "st-lg",
    };
    return sizeMap[props.size] || "st-md";
  });

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

  const iconClass = computed(() => {
    const iconMap: Record<string, string> = {
      success: "ci-success",
      info: "ci-info",
      warn: "ci-warn",
      error: "ci-error",
      dark: "ci-info",
    };
    return iconMap[props.theme || ""] || "ci-info";
  });

  const rootClass = computed(() => [sizeClass.value, themeClass.value]);

  const state = reactive({
    visible,
    sizeClass,
    themeClass,
    iconClass,
    rootClass,
  });

  function handleClose(event: MouseEvent) {
    if (!props.closable || !state.visible) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    callWithGuard(props.beforeClose, () => {
      visible.value = false;
      nextTick(() => {
        emit("closed");
      });
    });
  }

  const api = {
    handleClose,
  };

  return { state, api };
}
