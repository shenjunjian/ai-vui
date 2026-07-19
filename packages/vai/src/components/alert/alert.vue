<template>
  <div
    v-if="state.visible"
    ref="rootRef"
    class="sc-alert"
    :class="state.rootClass"
    role="alert"
  >
    <span v-if="showIcon" class="sc-alert__icon" aria-hidden="true">
      <slot name="icon" v-bind="{ state, api, props }">
        <i :class="state.iconClass" />
      </slot>
    </span>
    <div class="sc-alert__content">
      <slot v-bind="{ state, api, props }">Alert</slot>
    </div>
    <button
      v-if="closable"
      type="button"
      class="sc-alert__close"
      aria-label="关闭"
      @click="api.handleClose"
    >
      <slot name="close" v-bind="{ state, api, props }">×</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import useVm from "./alert.vm.ts";
import "./alert.less";
import { useTemplateRef } from "vue";

defineOptions({ name: "TinyAlert" });

const props = withDefaults(
  defineProps<{
    /** 尺寸 → st-sm / st-md / st-lg */
    size?: "sm" | "md" | "lg";
    /** 语义主题色；未指定时使用 control 中性色 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
    /** 是否显示前置状态图标 */
    showIcon?: boolean;
    /** 是否有关闭按钮 */
    closable?: boolean;
    /** 关闭前拦截；返回 true 允许关闭 */
    beforeClose?: () => boolean | Promise<boolean>;
  }>(),
  {
    size: "md",
    showIcon: true,
    closable: false,
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
    state: AlertState;
    api: AlertApi;
    props: AlertProps;
  }): any;
  /** 状态图标插槽 */
  icon(props: {
    state: AlertState;
    api: AlertApi;
    props: AlertProps;
  }): any;
  /** 关闭按钮内容插槽 */
  close(props: {
    state: AlertState;
    api: AlertApi;
    props: AlertProps;
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

export type AlertProps = typeof props;
export type AlertModels = typeof models;
export type AlertSlots = typeof slots;
export type AlertRefs = typeof refs;
export type AlertState = typeof state;
export type AlertApi = typeof api;
export type AlertEmit = typeof emit;
export type AlertCtx = {
  props: AlertProps;
  models: AlertModels;
  slots: AlertSlots;
  refs: AlertRefs;
  emit: AlertEmit;
};
</script>
