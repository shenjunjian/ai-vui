import {
  reactive,
  computed,
  watch,
  type InputHTMLAttributes,
} from "vue";
import type { CheckboxCtx } from "./checkbox.vue";

export default function useVm(ctx: CheckboxCtx) {
  const { props, models, refs, slots, attrs } = ctx;

  const sizeClass = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: "st-sm",
      md: "st-md",
      lg: "st-lg",
    };
    return sizeMap[props.size] || "st-md";
  });

  /** 视觉态：半选优先于勾选 */
  const visualState = computed(() => {
    if (props.indeterminate) return "indeterminate";
    return models.checked.value ? "checked" : "unchecked";
  });

  const showLabel = computed(() => !!props.label || !!slots.default);

  const inputAttrs = computed(() => {
    const {
      class: _c,
      style: _s,
      type: _t,
      disabled: _d,
      checked: _checked,
      ...rest
    } = attrs as InputHTMLAttributes & Record<string, unknown>;
    return rest;
  });

  const rootClass = computed(() => [
    sizeClass.value,
    {
      "st-disabled": props.disabled,
      "is-checked": visualState.value === "checked",
      "is-indeterminate": visualState.value === "indeterminate",
    },
  ]);

  function syncIndeterminate() {
    const el = refs.inputRef.value;
    if (!el) return;
    el.indeterminate = !!props.indeterminate;
  }

  watch(
    () => [props.indeterminate, refs.inputRef.value] as const,
    () => {
      syncIndeterminate();
    },
    { immediate: true },
  );

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    models.checked.value = target.checked;
    // 原生点击会清掉 indeterminate，受控 prop 为 true 时立即恢复
    syncIndeterminate();
  }

  function focus() {
    refs.inputRef.value?.focus();
  }

  function blur() {
    refs.inputRef.value?.blur();
  }

  function setCheck(value: boolean) {
    if (props.disabled) return;
    models.checked.value = value;
  }

  const state = reactive({
    sizeClass,
    visualState,
    showLabel,
    inputAttrs,
    rootClass,
  });

  const api = {
    handleChange,
    focus,
    blur,
    setCheck,
  };

  return { state, api };
}
