<script setup lang="ts">
import { nextTick, onMounted, ref, toValue, useTemplateRef, watch } from "vue";
import { useDrag } from "vai";

/** 容器内绝对定位拖动 */
const stage = useTemplateRef<HTMLElement>("stage");
const box = useTemplateRef<HTMLElement>("box");
const disabled = ref(false);

const { state: dragState } = useDrag({
  el: box,
  disabled,
  startDrag(s) {
    const el = toValue(s.el)!;
    s._.originLeft = parseFloat(el.style.left) || 0;
    s._.originTop = parseFloat(el.style.top) || 0;
  },
  applyDrag(s) {
    const el = toValue(s.el)!;
    const { rect, boundary, deltaX, deltaY } = s._;
    let left = (s._.originLeft as number) + deltaX;
    let top = (s._.originTop as number) + deltaY;
    const maxX = Math.max(0, boundary.width - rect.width);
    const maxY = Math.max(0, boundary.height - rect.height);
    left = Math.min(Math.max(0, left), maxX);
    top = Math.min(Math.max(0, top), maxY);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  },
});

onMounted(() => {
  if (stage.value) dragState.container = stage.value;
});

/** 晚就绪：v-if 打开后再 init */
const panelOpen = ref(false);
const panel = useTemplateRef<HTMLElement>("panel");
const header = useTemplateRef<HTMLElement>("header");

const { init: initPanel, stop: stopPanel, state: panelState } = useDrag({
  el: panel,
  handler: header,
  startDrag(s) {
    const el = toValue(s.el)!;
    const m = el.style.translate.match(
      /(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px/,
    );
    s._.baseX = m ? Number(m[1]) : 0;
    s._.baseY = m ? Number(m[2]) : 0;
  },
  applyDrag(s) {
    const el = toValue(s.el)!;
    el.style.translate = `${(s._.baseX as number) + s._.deltaX}px ${(s._.baseY as number) + s._.deltaY}px`;
  },
});

watch(panelOpen, async (v) => {
  if (v) {
    await nextTick();
    initPanel();
  } else {
    stopPanel();
  }
});
</script>

<template>
  <div class="drag-demo">
    <header class="drag-demo__header">
      <h1>useDrag</h1>
      <p>容器内拖动；定位策略由 applyDrag 决定。晚就绪场景需主动 init()。</p>
    </header>

    <section class="drag-demo__section">
      <h2>
        容器内拖动
        <small>dragging: {{ dragState._.isDragging }}</small>
      </h2>
      <p class="drag-demo__hint">拖动蓝块；位移限制在灰色舞台内。</p>
      <label class="drag-demo__check">
        <input v-model="disabled" type="checkbox" />
        disabled
      </label>
      <div ref="stage" class="drag-demo__stage">
        <div
          ref="box"
          class="drag-demo__box"
          style="left: 24px; top: 24px"
        >
          拖我
        </div>
      </div>
    </section>

    <section class="drag-demo__section">
      <h2>
        晚就绪 + header 手柄
        <small>dragging: {{ panelState._.isDragging }}</small>
      </h2>
      <p class="drag-demo__hint">
        面板通过 v-if 挂载；打开后 nextTick 再 init()。仅 header 可拖。
      </p>
      <button
        type="button"
        class="drag-demo__btn"
        @click="panelOpen = !panelOpen"
      >
        {{ panelOpen ? "关闭面板" : "打开面板" }}
      </button>
      <div v-if="panelOpen" ref="panel" class="drag-demo__panel">
        <div ref="header" class="drag-demo__panel-header">拖动手柄</div>
        <div class="drag-demo__panel-body">内容区不可拖</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.drag-demo {
  padding: 24px;
  max-width: 720px;
}

.drag-demo__header h1 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.drag-demo__header p {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.drag-demo__section {
  margin-bottom: 32px;
}

.drag-demo__section h2 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.drag-demo__section h2 small {
  margin-left: 8px;
  font-weight: 400;
  color: #9ca3af;
  font-size: 13px;
}

.drag-demo__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
}

.drag-demo__check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #374151;
}

.drag-demo__btn {
  appearance: none;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
}

.drag-demo__stage {
  position: relative;
  height: 220px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  overflow: hidden;
}

.drag-demo__box {
  position: absolute;
  width: 88px;
  height: 88px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #2563eb;
  border-radius: 8px;
  touch-action: none;
  user-select: none;
}

.drag-demo__box.st-dragging {
  opacity: 0.9;
}

.drag-demo__panel {
  margin-top: 16px;
  width: 260px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px rgb(0 0 0 / 6%);
  touch-action: none;
}

.drag-demo__panel-header {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
  cursor: move;
  user-select: none;
}

.drag-demo__panel-body {
  padding: 16px 12px;
  font-size: 13px;
  color: #6b7280;
}
</style>
