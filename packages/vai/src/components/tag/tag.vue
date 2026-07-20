<template>
  <span v-if="state.visible" ref="rootRef" class="v-tag" :class="state.rootClass">
    <slot v-bind="{ state, api, props }">Tag</slot>
    <button v-if="closable" type="button" class="v-tag__close" :disabled="disabled" aria-label="关闭"
      @click="api.handleClose">
      ×
    </button>
  </span>
</template>

<script setup lang="ts">
import useVm from "./tag.vm.ts";
import "./tag.less";
import { useTemplateRef } from "vue";

defineOptions({ name: "TinyTag" });

const props = withDefaults(
  defineProps<{
    /** 尺寸 → st-sm / st-md / st-lg */
    size?: "sm" | "md" | "lg";
    /** 禁用态 */
    disabled?: boolean;
    /** 是否有关闭按钮 */
    closable?: boolean;
    /** 语义主题色；未指定时为正常主色文字带边框 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
    /** 朴素主题色；仅指定 theme 时生效 */
    plain?: boolean;
    /** 左右半圆圆角 */
    circle?: boolean;
    /** 关闭前拦截；返回 true 允许关闭 */
    beforeClose?: (() => boolean | Promise<boolean>);
  }>(),
  {
    size: "md",
    disabled: false,
    closable: false,
    plain: false,
    circle: false,
  },
);

const emit = defineEmits<{
  /** 关闭后事件 */
  closed: [];
}>();

const models = {};

const slots = defineSlots<{
  /** 默认插槽 */
  default(props: {
    state: TagState;
    api: TagApi;
    props: TagProps;
  }): any;
}>();

const refs = {
  rootRef: useTemplateRef("rootRef"),
};
const { state, api } = useVm({ props, slots, refs, models, emit });

defineExpose({
  state,
  api,
});

export type TagProps = typeof props;
export type TagModels = typeof models;
export type TagSlots = typeof slots;
export type TagRefs = typeof refs;
export type TagState = typeof state;
export type TagApi = typeof api;
export type TagEmit = typeof emit;
export type TagCtx = {
  props: TagProps;
  models: TagModels;
  slots: TagSlots;
  refs: TagRefs;
  emit: TagEmit;
};
</script>
