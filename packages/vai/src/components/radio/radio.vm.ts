import {
  reactive,
  computed,
  type InputHTMLAttributes,
} from "vue";
import type { RadioCtx } from "./radio.vue";

export default function useVm(ctx: RadioCtx) {
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

  const visualState = computed(() =>
    models.checked.value ? "checked" : "unchecked",
  );

  const showLabel = computed(() => !!props.label || !!slots.default);

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    models.checked.value = target.checked;
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
    },
  ]);

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
