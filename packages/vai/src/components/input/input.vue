<template>
  <div ref="rootRef" class="v-input" :class="state.rootClass">
    <label
      v-if="state.showLabel"
      class="v-input__label"
      :for="state.inputId"
    >
      {{ label }}
    </label>
    <span v-if="$slots.prefix" class="v-input__prefix">
      <slot name="prefix" v-bind="{ state, api, props }" />
    </span>
    <input
      :id="state.inputId"
      ref="inputRef"
      class="v-input__inner"
      :type="state.inputType"
      :disabled="disabled"
      :value="modelValue"
      v-bind="state.inputAttrs"
      @input="api.handleInput"
      @keydown="api.handleKeydown"
      @focus="api.handleFocus"
      @blur="api.handleBlur"
    />
    <span v-if="showCount" class="v-input__count" aria-hidden="true">
      {{ state.charCountText }}
    </span>
    <span v-if="$slots.suffix" class="v-input__suffix">
      <slot name="suffix" v-bind="{ state, api, props }" />
    </span>
    <button
      v-if="state.showClear"
      type="button"
      class="v-input__clear"
      aria-label="清除"
      tabindex="-1"
      @click="api.clear"
    >
      <i class="ci-close" aria-hidden="true" />
    </button>
    <div
      ref="popperRef"
      class="v-input__suggest"
      role="listbox"
      :aria-hidden="!state.popVisible"
    >
      <div
        v-for="(item, index) in state.filteredItems"
        :key="`${item.label}-${index}`"
        class="v-input__suggest-item"
        :class="{ 'is-active': index === state.activeIndex }"
        role="option"
        :aria-selected="index === state.activeIndex"
        @mousedown.prevent="api.selectItem(item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useVm from "./input.vm.ts";
import "./input.less";
import { useAttrs, useTemplateRef } from "vue";
import type { PopperOption } from "../../hooks/usePopper.ts";

defineOptions({ name: "TinyInput", inheritAttrs: false });

export interface InputOption {
  label: string;
}

export type InputPopItems =
  | string[]
  | InputOption[]
  | ((query: string) => Promise<string[] | InputOption[]>);

export type InputPopperOption = Partial<
  Omit<PopperOption, "reference" | "popper" | "show">
>;

const props = withDefaults(
  defineProps<{
    /** 尺寸 */
    size?: "sm" | "md" | "lg";
    /** 语义主题色，只影响 border 和文字 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
    /** 禁用态 */
    disabled?: boolean;
    /** 有值时是否显示清除按钮 */
    clearable?: boolean;
    /** 是否显示为 password */
    password?: boolean;
    /** 是否显示字符数（位于 suffix 前） */
    showCount?: boolean;
    /** 清除前拦截；返回 true 允许清除 */
    beforeClear?: () => boolean | Promise<boolean>;
    /** 自动提示数据项 */
    popItems?: InputPopItems;
    /** 自动提示弹出层配置 */
    popperOption?: InputPopperOption;
    /** 变体：input 边框框体 / line 下划线 */
    variant?: "input" | "line";
    /** line 变体时的标题（浮动 label） */
    label?: string;
  }>(),
  {
    size: "md",
    disabled: false,
    clearable: false,
    password: false,
    showCount: false,
    popItems: () => [],
    variant: "input",
    label: "",
  },
);

const emit = defineEmits<{
  /** 值清除后的事件 */
  cleared: [];
}>();

/** 输入值（v-model） */
const modelValue = defineModel<string>({ default: "" });
const models = {
  modelValue,
};

const slots = defineSlots<{
  /** 默认内容 */
  default(props: {
    state: InputState;
    api: InputApi;
    props: InputProps;
  }): any;
  /** 前置图标内容 */
  prefix(props: {
    state: InputState;
    api: InputApi;
    props: InputProps;
  }): any;
  /** 后置图标内容 */
  suffix(props: {
    state: InputState;
    api: InputApi;
    props: InputProps;
  }): any;
}>();

const refs = {
  rootRef: useTemplateRef("rootRef"),
  inputRef: useTemplateRef("inputRef"),
  popperRef: useTemplateRef("popperRef"),
};

const attrs = useAttrs();

const { state, api } = useVm({ props, slots, refs, models, emit, attrs });

defineExpose({
  state,
  api,
});

export type InputProps = typeof props;
export type InputModels = typeof models;
export type InputSlots = typeof slots;
export type InputRefs = typeof refs;
export type InputState = typeof state;
export type InputApi = typeof api;
export type InputEmit = typeof emit;
export type InputCtx = {
  props: InputProps;
  models: InputModels;
  slots: InputSlots;
  refs: InputRefs;
  emit: InputEmit;
  attrs: typeof attrs;
};
</script>
