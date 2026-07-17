import { reactive, computed, toRef } from "vue";
import type { ButtonCtx } from "./button.vue";
import { useTimer } from "../../hooks/useTimer.ts";

export default function useVm(ctx: ButtonCtx) {
  const { props, models } = ctx;

  const { start: startCooldown, isPending } = useTimer(
    () => undefined,
    toRef(props, "resetTime"),
  );

  const canToggle = computed(
    () =>
      props.toggleMode &&
      (props.variant === "button" || props.variant === "icon"),
  );

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

  const isDisabled = computed(
    () => props.disabled || props.loading || isPending.value,
  );

  const toggleAriaPressed = computed(() => {
    if (!props.toggleMode) return undefined;
    if (props.variant !== "button" && props.variant !== "icon") {
      return undefined;
    }
    return models.pressed.value;
  });

  const rootClass = computed(() => [
    sizeClass.value,
    themeClass.value,
    {
      "st-disabled": isDisabled.value,
      "sc-plain-btn": props.plain && !!props.theme,
      "sc-ghost-btn": props.ghost,
      "sc-text-btn": props.variant === "text",
      "sc-link-btn": props.variant === "link",
      "sc-icon-btn": props.variant === "icon",
      "sc-circle-btn": props.circle,
      "st-pressed": canToggle.value && models.pressed.value,
      "sc-btn-loading": props.loading,
    },
  ]);

  const state = reactive({
    /** 有 resetTime 时，点击后的冷却状态 */
    pending: isPending,
    /** 是否允许 toggle 切换选中态 */
    canToggle,
    sizeClass,
    themeClass,
    isDisabled,
    toggleAriaPressed,
    rootClass,
  });

  function handleClick(event: MouseEvent) {
    if (props.disabled || props.loading || state.pending) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    // toggleMode：直接切换选中态，不需要 resetTime 防重复提交
    if (state.canToggle) {
      models.pressed.value = !models.pressed.value;
      return;
    }

    if (props.resetTime > 0) {
      void startCooldown();
    }
  }

  const api = {
    handleClick,
  };

  return { state, api };
}
