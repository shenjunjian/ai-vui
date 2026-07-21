<template>
  <dialog
    v-if="state.dialogMounted"
    ref="rootRef"
    class="v-modal"
    :class="state.rootClass"
    :style="state.dialogStyle"
    :closedby="closedby"
    tabindex="-1"
    :aria-labelledby="showHeader ? titleId : undefined"
    @cancel="api.handleCancel"
    @close="api.handleDialogClose"
  >
    <header
      v-if="showHeader"
      class="v-modal__header"
      :class="{ 'is-draggable': state.canDrag }"
      @pointerdown="api.handleDragStart"
    >
      <div :id="titleId" class="v-modal__title">
        <slot name="title" v-bind="{ state, api, props }">{{ title }}</slot>
      </div>
      <button
        v-if="showClose"
        type="button"
        class="v-modal__close"
        aria-label="关闭"
        @click="api.requestClose"
        @pointerdown.stop
      >
        <slot name="close" v-bind="{ state, api, props }">
          <i class="ci-close" aria-hidden="true" />
        </slot>
      </button>
    </header>

    <div class="v-modal__body">
      <slot v-bind="{ state, api, props }" />
    </div>

    <footer v-if="showFooter" class="v-modal__footer" @pointerdown.stop>
      <slot name="footer" v-bind="{ state, api, props }">
        <Button @click="api.requestClose">取消</Button>
        <Button theme="info" @click="api.requestClose">确定</Button>
      </slot>
    </footer>

    <div
      v-if="state.canResize"
      class="v-modal__resize"
      :class="state.resizeClass"
      aria-hidden="true"
      @pointerdown="api.handleResizeStart"
    />
  </dialog>
</template>

<script setup lang="ts">
import useVm from "./dialog.vm.ts";
import "./dialog.less";
import { useTemplateRef } from "vue";
import Button from "../button/button.vue";

defineOptions({ name: "TinyDialog" });

const props = withDefaults(
  defineProps<{
    /** 标题文案 */
    title?: string;
    /** 是否显示关闭图标 */
    showClose?: boolean;
    /** Light Dismiss：any / closerequest / none */
    closedby?: "none" | "closerequest" | "any";
    /** 是否显示遮罩 */
    showMask?: boolean;
    /** 遮罩样式：半透明或毛玻璃 */
    maskStyle?: "opaque" | "blur";
    /** 显示 header */
    showHeader?: boolean;
    /** 显示 footer */
    showFooter?: boolean;
    /** 是否允许拖动 header（drawer 时无效） */
    draggable?: boolean;
    /** 是否允许改变尺寸 */
    resizable?: boolean;
    /** 打开后自动聚焦第一个可聚焦元素 */
    autoFocus?: boolean;
    /** 关闭前拦截；返回 true 允许关闭 */
    beforeClose?: () => boolean | Promise<boolean>;
    /** 关闭时是否销毁整个 dialog 元素 */
    destroyOnClose?: boolean;
    /** 外观变体 */
    variant?: "dialog" | "drawer";
    /** drawer 贴边位置 */
    placement?: "right" | "left" | "top" | "bottom";
  }>(),
  {
    title: "",
    showClose: true,
    closedby: "any",
    showMask: true,
    maskStyle: "opaque",
    showHeader: true,
    showFooter: true,
    draggable: false,
    resizable: false,
    autoFocus: true,
    destroyOnClose: false,
    variant: "dialog",
    placement: "right",
  },
);

const emit = defineEmits<{
  /** 对话框已打开 */
  opened: [];
  /** 对话框已关闭 */
  closed: [];
  /** 拖动开始 */
  "drag-start": [];
  /** 拖动中 */
  "drag-move": [];
  /** 拖动结束 */
  "drag-end": [];
}>();

/** 是否打开 */
const open = defineModel<boolean>("open", { default: false });
const models = {
  open,
};

const slots = defineSlots<{
  /** 正文 */
  default(props: {
    state: DialogState;
    api: DialogApi;
    props: DialogProps;
  }): any;
  /** 标题 */
  title(props: {
    state: DialogState;
    api: DialogApi;
    props: DialogProps;
  }): any;
  /** 页脚 */
  footer(props: {
    state: DialogState;
    api: DialogApi;
    props: DialogProps;
  }): any;
  /** 关闭按钮内容 */
  close(props: {
    state: DialogState;
    api: DialogApi;
    props: DialogProps;
  }): any;
}>();

const refs = {
  rootRef: useTemplateRef<HTMLDialogElement>("rootRef"),
};
const { state, api, titleId } = useVm({ props, slots, refs, models, emit });

defineExpose({
  state,
  api,
});

export type DialogProps = typeof props;
export type DialogModels = typeof models;
export type DialogSlots = typeof slots;
export type DialogRefs = typeof refs;
export type DialogState = typeof state;
export type DialogApi = typeof api;
export type DialogEmit = typeof emit;
export type DialogCtx = {
  props: DialogProps;
  models: DialogModels;
  slots: DialogSlots;
  refs: DialogRefs;
  emit: DialogEmit;
};
</script>
