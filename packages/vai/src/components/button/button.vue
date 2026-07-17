<template>
  <button ref="rootRef" type="button" class="sc-btn" :class="rootClass" :disabled="isDisabled"
    :aria-busy="loading || undefined" :aria-pressed="toggleAriaPressed" @click="api.handleClick">
    <span v-if="loading" class="sc-btn__loading" aria-hidden="true" />
    <slot v-bind="{ state, api, props }">Button</slot>
  </button>
</template>

<script setup lang="ts">
import useVm from "./button.vm.ts";
import "./button.less";
import { useTemplateRef, computed } from "vue";

defineOptions({ name: "TinyButton" });

const props = withDefaults(
  defineProps<{
    /** 尺寸 */
    size?: "sm" | "md" | "lg";
    /** 语义主题色；未指定时使用 control 中性色 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
    /** 朴素主题色；仅指定 theme 时生效 */
    plain?: boolean;
    /** 幽灵按钮（透明背景，保留主题色文字与边框） */
    ghost?: boolean;
    /** 外观变体 */
    variant?: "button" | "text" | "link" | "icon";
    /** button 变体时左右半圆；icon 变体时为正圆 */
    circle?: boolean;
    /** 禁用态 */
    disabled?: boolean;
    /** 加载中；展示 loading 指示并禁止点击，不强制同步 disabled prop */
    loading?: boolean;
    /** 切换模式，仅 button / icon 变体生效 */
    toggleMode?: boolean;
    /** 点击后禁用时长（ms），防止重复提交；为 0 时关闭 */
    resetTime?: number;
  }>(),
  {
    size: "md",
    plain: false,
    ghost: false,
    variant: "button",
    circle: false,
    disabled: false,
    loading: false,
    toggleMode: false,
    resetTime: 1000,
  },
);

/** 选中态（受控）；toggleMode 为 true 时生效 */
const pressed = defineModel<boolean>("pressed", { default: false });
const models = {
  pressed,
};

const slots = defineSlots<{
  /** 默认插槽 */
  default(props: {
    state: ButtonState;
    api: ButtonApi;
    props: ButtonProps;
  }): any;
}>();

const refs = {
  rootRef: useTemplateRef("rootRef"),
};
const { state, api } = useVm({ props, slots, refs, models });

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
  () => props.disabled || props.loading || state.pending,
);

const toggleAriaPressed = computed(() => {
  if (!props.toggleMode) return undefined;
  if (props.variant !== "button" && props.variant !== "icon") return undefined;
  return pressed.value;
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
    "st-pressed":
      props.toggleMode &&
      pressed.value &&
      (props.variant === "button" || props.variant === "icon"),
    "sc-btn-loading": props.loading,
  },
]);

defineExpose({
  state,
  api,
});

export type ButtonProps = typeof props;
export type ButtonModels = typeof models;
export type ButtonSlots = typeof slots;
export type ButtonRefs = typeof refs;
export type ButtonState = typeof state;
export type ButtonApi = typeof api;
export type ButtonCtx = {
  props: ButtonProps;
  models: ButtonModels;
  slots: ButtonSlots;
  refs: ButtonRefs;
};
</script>
