<script setup lang="ts">
import { ref } from "vue";
import { Dialog, Button } from "vai";

const basicOpen = ref(false);
const blurOpen = ref(false);
const noMaskOpen = ref(false);
const dragOpen = ref(false);
const resizeOpen = ref(false);
const guardOpen = ref(false);
const destroyOpen = ref(false);
const drawerOpen = ref(false);
const drawerPlacement = ref<"right" | "left" | "top" | "bottom">("right");

const eventLog = ref<string[]>([]);

function log(msg: string) {
  eventLog.value = [...eventLog.value.slice(-8), msg];
}

const blockClose = () => false;
const allowCloseAsync = () =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 400));
</script>

<template>
  <div class="dialog-demo">
    <header class="dialog-demo__header">
      <h1>Dialog</h1>
      <p>覆盖打开关闭、遮罩、拖拽缩放、拦截、销毁与 drawer 变体</p>
    </header>

    <section class="dialog-demo__section">
      <h2>基础 / 插槽</h2>
      <div class="dialog-demo__row">
        <Button theme="info" @click="basicOpen = true">打开基础对话框</Button>
      </div>
      <Dialog v-model:open="basicOpen" title="基础对话框" @opened="log('opened')" @closed="log('closed')">
        <p>默认 header + body + footer（取消 / 确定）。正文过长时自动滚动。</p>
        <p v-for="n in 12" :key="n">段落 {{ n }} — 用于演示 body 滚动。</p>
      </Dialog>
    </section>

    <section class="dialog-demo__section">
      <h2>遮罩 show-mask / mask-style</h2>
      <div class="dialog-demo__row">
        <Button @click="blurOpen = true">毛玻璃遮罩</Button>
        <Button @click="noMaskOpen = true">无遮罩</Button>
      </div>
      <Dialog v-model:open="blurOpen" title="毛玻璃" mask-style="blur" closedby="any">
        mask-style="blur"
      </Dialog>
      <Dialog v-model:open="noMaskOpen" title="无遮罩" :show-mask="false" closedby="closerequest">
        show-mask=false（Esc 仍可关，点外部不关）
      </Dialog>
    </section>

    <section class="dialog-demo__section">
      <h2>拖拽 / 缩放</h2>
      <div class="dialog-demo__row">
        <Button @click="dragOpen = true">可拖拽</Button>
        <Button @click="resizeOpen = true">可缩放</Button>
      </div>
      <Dialog v-model:open="dragOpen" title="拖动标题栏移动" draggable @drag-start="log('drag-start')"
        @drag-move="log('drag-move')" @drag-end="log('drag-end')">
        按住 header 拖动
      </Dialog>
      <Dialog v-model:open="resizeOpen" title="右下角缩放" resizable draggable>
        拖动右下角改变大小，也可拖动标题
      </Dialog>
    </section>

    <section class="dialog-demo__section">
      <h2>beforeClose / destroy-on-close</h2>
      <div class="dialog-demo__row">
        <Button theme="warn" @click="guardOpen = true">拦截关闭</Button>
        <Button theme="error" @click="destroyOpen = true">关闭销毁</Button>
      </div>
      <Dialog v-model:open="guardOpen" title="beforeClose" :before-close="blockClose">
        点击关闭 / 取消会被拦截（beforeClose → false）
        <template #footer="{ api }">
          <Button @click="api.requestClose">尝试关闭（拦截）</Button>
          <Button theme="info" @click="guardOpen = false">强制关掉 open</Button>
        </template>
      </Dialog>
      <Dialog v-model:open="destroyOpen" title="destroy-on-close" destroy-on-close :before-close="allowCloseAsync">
        关闭时销毁内部；再次打开会重新挂载。关闭经 400ms Promise 放行。
      </Dialog>
    </section>

    <section class="dialog-demo__section">
      <h2>Drawer 变体</h2>
      <div class="dialog-demo__row">
        <Button v-for="p in (['right', 'left', 'top', 'bottom'] as const)" :key="p"
          :theme="drawerPlacement === p ? 'info' : undefined" @click="drawerPlacement = p; drawerOpen = true">
          {{ p }}
        </Button>
      </div>
      <Dialog v-model:open="drawerOpen" variant="drawer" :placement="drawerPlacement"
        :title="`Drawer · ${drawerPlacement}`" resizable>
        drawer 贴 {{ drawerPlacement }}；resizable 拖空闲边。draggable 在 drawer
        下无效。
      </Dialog>
    </section>

    <p class="dialog-demo__hint">事件：{{ eventLog.join(" → ") || "暂无" }}</p>

    <!-- <p style="height: 500px;">占位，制造滚动条</p> -->
  </div>
</template>

<style scoped>
.dialog-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
  max-width: 720px;
}

.dialog-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.dialog-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.dialog-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.dialog-demo__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.dialog-demo__hint {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  font-family: ui-monospace, Consolas, monospace;
}
</style>
