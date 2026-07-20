import {
  reactive,
  computed,
  watch,
  nextTick,
  onMounted,
  type CSSProperties,
  type TextareaHTMLAttributes,
} from "vue";
import type { TextAreaCtx } from "./text-area.vue";

function parsePx(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function useVm(ctx: TextAreaCtx) {
  const { props, models, refs, attrs } = ctx;

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

  const charCountText = computed(() => {
    const len = models.modelValue.value?.length ?? 0;
    const max = attrs.maxlength;
    if (max != null && max !== "") {
      return `${len}/${max}`;
    }
    return String(len);
  });

  const textareaAttrs = computed(() => {
    const {
      class: _c,
      style: _s,
      disabled: _d,
      value: _v,
      ...rest
    } = attrs as TextareaHTMLAttributes & Record<string, unknown>;
    return rest;
  });

  const autoHeight = reactive({
    height: "" as string,
    overflowY: "" as string,
  });

  const textareaStyle = computed((): CSSProperties | (CSSProperties | string)[] => {
    const userStyle = attrs.style as CSSProperties | string | undefined;
    if (!props.autoSize) {
      return (userStyle as CSSProperties) ?? {};
    }

    const auto: CSSProperties = {
      height: autoHeight.height || undefined,
      overflowY:
        (autoHeight.overflowY as CSSProperties["overflowY"]) || "hidden",
      resize: "none",
    };

    if (userStyle == null || userStyle === "") return auto;
    return [userStyle, auto];
  });

  const rootClass = computed(() => [
    sizeClass.value,
    themeClass.value,
    {
      "st-disabled": props.disabled,
      "is-show-count": props.showCount,
      "is-auto-size": !!props.autoSize,
    },
  ]);

  function adjustHeight() {
    const el = refs.textareaRef.value;
    if (!el || !props.autoSize) {
      autoHeight.height = "";
      autoHeight.overflowY = "";
      return;
    }

    const { minRows, maxRows } = props.autoSize;
    const min = Math.max(1, minRows);
    const max = Math.max(min, maxRows);

    // 先塌缩再量 scrollHeight，避免内容变短时高度不回落
    el.style.height = "0px";
    el.style.overflowY = "hidden";

    const style = getComputedStyle(el);
    const lineHeight = parsePx(style.lineHeight) || parsePx(style.fontSize) * 1.5;
    const paddingY = parsePx(style.paddingTop) + parsePx(style.paddingBottom);
    const borderY =
      parsePx(style.borderTopWidth) + parsePx(style.borderBottomWidth);

    const minHeight = min * lineHeight + paddingY + borderY;
    const maxHeight = max * lineHeight + paddingY + borderY;
    const contentHeight = el.scrollHeight + borderY;

    const nextHeight = Math.min(maxHeight, Math.max(minHeight, contentHeight));
    autoHeight.height = `${nextHeight}px`;
    autoHeight.overflowY = contentHeight > maxHeight ? "auto" : "hidden";

    el.style.height = autoHeight.height;
    el.style.overflowY = autoHeight.overflowY;
  }

  function scheduleAdjust() {
    nextTick(() => {
      adjustHeight();
    });
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    models.modelValue.value = target.value;
    if (props.autoSize) scheduleAdjust();
  }

  function focus() {
    refs.textareaRef.value?.focus();
  }

  function blur() {
    refs.textareaRef.value?.blur();
  }

  function selectall() {
    refs.textareaRef.value?.select();
  }

  function clear() {
    if (props.disabled) return;
    models.modelValue.value = "";
    if (props.autoSize) scheduleAdjust();
  }

  watch(
    () => [models.modelValue.value, props.autoSize, props.size] as const,
    () => {
      if (props.autoSize) scheduleAdjust();
      else {
        autoHeight.height = "";
        autoHeight.overflowY = "";
      }
    },
    { deep: true },
  );

  onMounted(() => {
    if (props.autoSize) adjustHeight();
  });

  const state = reactive({
    sizeClass,
    themeClass,
    rootClass,
    charCountText,
    textareaAttrs,
    textareaStyle,
  });

  const api = {
    handleInput,
    focus,
    blur,
    clear,
    selectall,
    adjustHeight,
  };

  return { state, api };
}
