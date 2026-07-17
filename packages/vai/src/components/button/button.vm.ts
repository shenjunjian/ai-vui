import { reactive, computed, toRef } from "vue";
import type { ButtonCtx } from "./button.vue";
import { useTimer } from "../../hooks/useTimer.ts";

export default function useVm(ctx: ButtonCtx) {
  const { props, models } = ctx;

  const { start: startCooldown, isPending } = useTimer(
    () => undefined,
    toRef(props, "resetTime"),
  );

  const state = reactive({
    /** 有 resetTime 时，点击后的冷却状态 */
    pending: isPending,
  });

  const canToggle = computed(
    () =>
      props.toggleMode &&
      (props.variant === "button" || props.variant === "icon"),
  );

  function handleClick(event: MouseEvent) {
    if (props.disabled || props.loading || state.pending) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    // toggleMode：直接切换选中态，不需要 resetTime 防重复提交
    if (canToggle.value) {
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
