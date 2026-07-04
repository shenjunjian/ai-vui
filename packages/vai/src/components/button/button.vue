<template>
  <button
    ref="rootRef"
    class="sc-btn"
    :class="[sizeClass, themeClass, { 'st-disabled': disabled }]"
    :disabled="disabled"
  >
    <slot v-bind="{ state, api, props }">Button</slot>
  </button>
</template>

<script setup lang="ts">
import useVm from "./button.vm.ts";
import "./button.less";
import { useTemplateRef, computed } from "vue";

defineOptions({ name: "TinyButton" });

// TODO: 模板的slot的作用域变量最好统一{ state, api, props }， 排查动画，排查aria-*
// TODO: 规范： 必须写注释和默认值,   2、下面的写法丢失运行时props校验
const props = withDefaults(
  defineProps<{
    /** 设置主题色  */
    theme?: "default" | "dark" | "success" | "info" | "warn" | "error";
    /** 设置按钮大小 */
    size?: "xs" | "sm" | "md" | "lg";
    /** 是否禁用 */
    disabled?: boolean;
  }>(),
  {
    theme: "default",
    size: "md",
    disabled: false,
  },
);

/** 双向绑定值，必须是props中同样定义一下，以便有类型提示 */
const open = defineModel<boolean>("open", { default: false }); // defineModel 必须写在外层
const models = {
  open,
};

// TODO 规范： 通用注入 state,api, props方便用户使用
const slots = defineSlots<{
  /** 默认插槽 @since 1.0.0*/
  default(props: {
    state: ButtonState;
    api: ButtonApi;
    props: ButtonProps;
  }): any;
}>();

// Computed classes for scene-theme integration
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
  const themeMap: Record<string, string> = {
    default: "st-control",
    dark: "st-dark",
    success: "st-success",
    info: "st-info",
    warn: "st-warn",
    error: "st-error",
  };
  return themeMap[props.theme] || "st-control";
});

const refs = {
  rootRef: useTemplateRef("rootRef"),
};
const { state, api } = useVm({ props, slots, refs, models });

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
