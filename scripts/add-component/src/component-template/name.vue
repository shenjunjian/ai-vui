<template>
  <div ref="rootRef" class="tiny-$rawName$">
    <slot v-bind="{ state, api, props }">$capName$</slot>
  </div>
</template>

<script setup lang="ts">
import useVm from "./$rawName$.vm.ts";
import "./$rawName$.less";
import { useTemplateRef } from "vue";

defineOptions({ name: "Tiny$capName$" });

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
    state: $capName$State;
    api: $capName$Api;
    props: $capName$Props;
  }): any;
}>();

const refs = {
  rootRef: useTemplateRef("rootRef"),
};
const { state, api } = useVm({ props, slots, refs, models });

defineExpose({
  state,
  api,
});

export type $capName$Props = typeof props;
export type $capName$Models = typeof models;
export type $capName$Slots = typeof slots;
export type $capName$Refs = typeof refs;
export type $capName$State = typeof state;
export type $capName$Api = typeof api;
export type $capName$Ctx = {
  props: $capName$Props;
  models: $capName$Models;
  slots: $capName$Slots;
  refs: $capName$Refs;
};
</script>
