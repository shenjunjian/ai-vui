<template>
  <label ref="rootRef" class="sc-radio" :class="state.rootClass">
    <span class="sc-radio__control">
      <input
        ref="inputRef"
        type="radio"
        class="sc-radio__input"
        :checked="checked"
        :disabled="disabled"
        v-bind="state.inputAttrs"
      />
    </span>
    <span v-if="state.showLabel" class="sc-radio__label">
      <slot v-bind="{ state, api, props }">{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import useVm from "./radio.vm.ts";
import "./radio.less";
import { useAttrs, useTemplateRef } from "vue";

defineOptions({ name: "TinyRadio", inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** 尺寸 */
    size?: "sm" | "md" | "lg";
    /** 语义主题色；未指定时使用 control 中性色 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
    /** 禁用态 */
    disabled?: boolean;
    /** 文本内容；无默认插槽时作为 label 显示 */
    label?: string;
  }>(),
  {
    size: "md",
    disabled: false,
    label: "",
  },
);

/** 是否勾选（v-model:checked） */
const checked = defineModel<boolean>("checked", { default: false });
const models = {
  checked,
};

const slots = defineSlots<{
  /** 默认 label 内容 */
  default(props: {
    state: RadioState;
    api: RadioApi;
    props: RadioProps;
  }): any;
}>();

const refs = {
  rootRef: useTemplateRef("rootRef"),
  inputRef: useTemplateRef("inputRef"),
};

const attrs = useAttrs();

const { state, api } = useVm({ props, slots, refs, models, attrs });

defineExpose({
  state,
  api,
});

export type RadioProps = typeof props;
export type RadioModels = typeof models;
export type RadioSlots = typeof slots;
export type RadioRefs = typeof refs;
export type RadioState = typeof state;
export type RadioApi = typeof api;
export type RadioCtx = {
  props: RadioProps;
  models: RadioModels;
  slots: RadioSlots;
  refs: RadioRefs;
  attrs: typeof attrs;
};
</script>
