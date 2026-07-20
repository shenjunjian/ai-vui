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

  /** 视觉态：半选优先于勾选 */
  const visualState = computed(() => {
    if (props.indeterminate) return "indeterminate";
    return models.checked.value ? "checked" : "unchecked";
  });

  const showLabel = computed(() => !!props.label || !!slots.default);

  function syncIndeterminate() {
    const el = refs.inputRef.value;
    if (!el) return;
    el.indeterminate = !!props.indeterminate;
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    models.checked.value = target.checked;
    // 原生点击会清掉 indeterminate，受控 prop 为 true 时立即恢复
    syncIndeterminate();
  }

  function invokeChange(
    listener: ((e: Event) => void) | ((e: Event) => void)[] | undefined,
    event: Event,
  ) {
    if (!listener) return;
    if (Array.isArray(listener)) {
      listener.forEach((fn) => fn(event));
      return;
    }
    listener(event);
  }

  const inputAttrs = computed(() => {
    const {
      class: _c,
      style: _s,
      type: _t,
      disabled: _d,
      checked: _checked,
      onChange,
      ...rest
    } = attrs as InputHTMLAttributes &
      Record<string, unknown> & {
        onChange?: ((e: Event) => void) | ((e: Event) => void)[];
      };
    return {
      ...rest,
      onChange: (event: Event) => {
        handleChange(event);
        invokeChange(onChange, event);
      },
    };
  });

  const rootClass = computed(() => [
    sizeClass.value,
    themeClass.value,
    {
      "st-disabled": props.disabled,
      "is-checked": visualState.value === "checked",
      "is-indeterminate": visualState.value === "indeterminate",
    },
  ]);

  watch(
    () => [props.indeterminate, refs.inputRef.value] as const,
    () => {
      syncIndeterminate();
    },
    { immediate: true },
  );

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
    themeClass,
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
