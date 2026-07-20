<template>
  <div ref="rootRef" class="v-numeric" :class="state.rootClass">
    <button
      v-if="state.showControls"
      type="button"
      class="v-numeric__btn v-numeric__btn--minus"
      aria-label="减少"
      tabindex="-1"
      :disabled="state.minusDisabled"
      @click="api.decrease"
    >
      <i class="ci-minus1" aria-hidden="true" />
    </button>
    <input
      ref="inputRef"
      class="v-numeric__inner"
      type="number"
      :disabled="disabled"
      :value="state.displayValue"
      v-bind="state.inputAttrs"
      @input="api.handleInput"
      @change="api.handleChange"
      @keydown="api.handleKeydown"
      @paste="api.handlePaste"
    />
    <button
      v-if="state.showControls"
      type="button"
      class="v-numeric__btn v-numeric__btn--plus"
      aria-label="增加"
      tabindex="-1"
      :disabled="state.plusDisabled"
      @click="api.increase"
    >
      <i class="ci-plus1" aria-hidden="true" />
    </button>
    <span v-else-if="state.showUnit" class="v-numeric__unit" aria-hidden="true">
      {{ unit }}
    </span>
  </div>
</template>

<script setup lang="ts">
import useVm from "./numeric.vm.ts";
import "./numeric.less";
import { useAttrs, useTemplateRef } from "vue";

defineOptions({ name: "TinyNumeric", inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** 尺寸 */
    size?: "sm" | "md" | "lg";
    /** 语义主题色，只影响 border 和文字 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
    /** 禁用态 */
    disabled?: boolean;
    /** 到达边界后是否循环到另一端 */
    loop?: boolean;
    /** 是否显示左右增减按钮 */
    controls?: boolean;
    /** 单位文案；有单位时不显示 controls */
    unit?: string;
    /** 粘贴时解析剪贴板文本 */
    parse?: (str: string) => number;
  }>(),
  {
    size: "md",
    disabled: false,
    loop: false,
    controls: true,
    unit: "",
  },
);

const emit = defineEmits<{
  /** 值变化时立即触发 */
  input: [value: number];
  /** 值确认时触发（失焦提交，或增减 / api / 粘贴等立即确认的操作） */
  change: [value: number];
}>();

/** 数字值（v-model），空值为 NaN */
const modelValue = defineModel<number>({ default: Number.NaN });
const models = {
  modelValue,
};

const refs = {
  rootRef: useTemplateRef("rootRef"),
  inputRef: useTemplateRef("inputRef"),
};

const attrs = useAttrs();

const { state, api } = useVm({ props, refs, models, emit, attrs });

defineExpose({
  state,
  api,
});

export type NumericProps = typeof props;
export type NumericModels = typeof models;
export type NumericRefs = typeof refs;
export type NumericState = typeof state;
export type NumericApi = typeof api;
export type NumericEmit = typeof emit;
export type NumericCtx = {
  props: NumericProps;
  models: NumericModels;
  refs: NumericRefs;
  emit: NumericEmit;
  attrs: typeof attrs;
};
</script>
