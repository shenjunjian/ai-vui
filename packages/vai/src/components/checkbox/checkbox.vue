<template>
  <label ref="rootRef" class="sc-checkbox" :class="state.rootClass">
    <span class="sc-checkbox__control">
      <input
        ref="inputRef"
        type="checkbox"
        class="sc-checkbox__input"
        :checked="checked"
        :disabled="disabled"
        v-bind="state.inputAttrs"
        @change="api.handleChange"
      />
    </span>
    <span v-if="state.showLabel" class="sc-checkbox__label">
      <slot v-bind="{ state, api, props }">{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import useVm from "./checkbox.vm.ts";
import "./checkbox.less";
import { useAttrs, useTemplateRef } from "vue";

defineOptions({ name: "TinyCheckbox", inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** 尺寸 */
    size?: "sm" | "md" | "lg";
    /** 禁用态 */
    disabled?: boolean;
    /** 文本内容；无默认插槽时作为 label 显示 */
    label?: string;
    /** 半选；为 true 时优先于 checked 显示半选图标，并同步到 input.indeterminate */
    indeterminate?: boolean;
  }>(),
  {
    size: "md",
    disabled: false,
    label: "",
    indeterminate: false,
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
    state: CheckboxState;
    api: CheckboxApi;
    props: CheckboxProps;
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

export type CheckboxProps = typeof props;
export type CheckboxModels = typeof models;
export type CheckboxSlots = typeof slots;
export type CheckboxRefs = typeof refs;
export type CheckboxState = typeof state;
export type CheckboxApi = typeof api;
export type CheckboxCtx = {
  props: CheckboxProps;
  models: CheckboxModels;
  slots: CheckboxSlots;
  refs: CheckboxRefs;
  attrs: typeof attrs;
};
</script>
