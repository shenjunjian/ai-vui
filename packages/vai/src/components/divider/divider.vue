<template>
  <div
    ref="rootRef"
    class="v-divider"
    :class="state.rootClass"
    :style="state.lineStyle"
    role="separator"
    :aria-orientation="vertical ? 'vertical' : 'horizontal'"
  />
</template>

<script setup lang="ts">
import useVm from "./divider.vm.ts";
import "./divider.less";
import { useTemplateRef } from "vue";

defineOptions({ name: "TinyDivider" });

const props = withDefaults(
  defineProps<{
    /** 是否垂直 */
    vertical?: boolean;
    /** 线型，对应 CSS border-style */
    borderStyle?: string;
    /** 语义主题色；未指定时为灰色 */
    theme?: "success" | "info" | "warn" | "error" | "dark";
  }>(),
  {
    vertical: false,
    borderStyle: "solid",
  },
);

const models = {};

const slots = {};

const refs = {
  rootRef: useTemplateRef("rootRef"),
};
const { state, api } = useVm({ props, slots, refs, models });

defineExpose({
  state,
  api,
});

export type DividerProps = typeof props;
export type DividerModels = typeof models;
export type DividerSlots = typeof slots;
export type DividerRefs = typeof refs;
export type DividerState = typeof state;
export type DividerApi = typeof api;
export type DividerCtx = {
  props: DividerProps;
  models: DividerModels;
  slots: DividerSlots;
  refs: DividerRefs;
};
</script>
