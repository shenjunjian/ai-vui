import { reactive, computed, ref, nextTick } from "vue";
import type { TagCtx } from "./tag.vue";
import { callWithGuard } from "../../utils/promiseHelper.ts";

export default function useVm(ctx: TagCtx) {
  const { props, emit } = ctx;

  const visible = ref(true);

  const sizeClass = computed(() => {
    const sizeMap: Record<string, string> = {
      xs: "st-xs",
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

  const rootClass = computed(() => [
    sizeClass.value,
    themeClass.value,
    {
      "st-disabled": props.disabled,
      "sc-plain-tag": props.plain && !!props.theme,
      "sc-circle-tag": props.circle,
    },
  ]);

  const state = reactive({
    visible,
    sizeClass,
    themeClass,
    rootClass,
  });

  function handleClose(event: MouseEvent) {
    if (props.disabled || !props.closable || !state.visible) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    callWithGuard(props.beforeClose ?? true, () => {
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
