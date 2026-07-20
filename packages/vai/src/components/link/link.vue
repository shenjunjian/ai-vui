<template>
  <a
    ref="rootRef"
    class="v-link"
    :class="state.rootClass"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
    @click="api.handleClick"
  >
    <slot v-bind="{ state, api, props }">Link</slot>
  </a>
</template>

<script setup lang="ts">
import useVm from "./link.vm.ts";
import "./link.less";
import { useTemplateRef } from "vue";

defineOptions({ name: "TinyLink" });

const props = withDefaults(
  defineProps<{
    /** 尺寸 → st-sm / st-md / st-lg */
    size?: "sm" | "md" | "lg";
    /** 语义主题色；未指定时为正常主色文字，悬停高亮为 Info 色 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
    /** 禁用态 */
    disabled?: boolean;
    /** 下划线：none 无 / hover 悬停显示 / always 始终显示 */
    underline?: "none" | "hover" | "always";
  }>(),
  {
    size: "md",
    disabled: false,
    underline: "hover",
  },
);

const models = {};

const slots = defineSlots<{
  /** 默认插槽 */
  default(props: {
    state: LinkState;
    api: LinkApi;
    props: LinkProps;
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

export type LinkProps = typeof props;
export type LinkModels = typeof models;
export type LinkSlots = typeof slots;
export type LinkRefs = typeof refs;
export type LinkState = typeof state;
export type LinkApi = typeof api;
export type LinkCtx = {
  props: LinkProps;
  models: LinkModels;
  slots: LinkSlots;
  refs: LinkRefs;
};
</script>
