<template>
  <div ref="rootRef" class="v-textarea" :class="state.rootClass">
    <textarea ref="textareaRef" class="v-textarea__inner" :disabled="disabled" :value="modelValue"
      :style="state.textareaStyle" v-bind="state.textareaAttrs" @input="api.handleInput" />
    <span v-if="showCount" class="v-textarea__count" aria-hidden="true">
      {{ state.charCountText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import useVm from "./text-area.vm.ts";
import "./text-area.less";
import { useAttrs, useTemplateRef } from "vue";

defineOptions({ name: "TinyTextArea", inheritAttrs: false });

export interface TextAreaAutoSize {
  minRows: number;
  maxRows: number;
}

const props = withDefaults(
  defineProps<{
    /** 尺寸 */
    size?: "sm" | "md" | "lg";
    /** 语义主题色，只影响 border 和文字 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
    /** 禁用态 */
    disabled?: boolean;
    /** 指定最小/最大行数，随内容自动调整高度 */
    autoSize?: TextAreaAutoSize;
    /** 是否显示字符数（右下角）；若透传 maxlength 则显示 当前/最大 */
    showCount?: boolean;
  }>(),
  {
    size: "md",
    disabled: false,
    showCount: false,
  },
);

/** 输入值（v-model） */
const modelValue = defineModel<string>({ default: "" });
const models = {
  modelValue,
};

const refs = {
  rootRef: useTemplateRef("rootRef"),
  textareaRef: useTemplateRef("textareaRef"),
};

const attrs = useAttrs();

const { state, api } = useVm({ props, refs, models, attrs });

defineExpose({
  state,
  api,
});

export type TextAreaProps = typeof props;
export type TextAreaModels = typeof models;
export type TextAreaRefs = typeof refs;
export type TextAreaState = typeof state;
export type TextAreaApi = typeof api;
export type TextAreaCtx = {
  props: TextAreaProps;
  models: TextAreaModels;
  refs: TextAreaRefs;
  attrs: typeof attrs;
};
</script>
