<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from "vue";
import { useFocusTrap } from "vai";

/** 基础：打开启用 / 关闭停用，Tab 在面板内循环 */
const basicOpen = ref(false);
const basicPanel = useTemplateRef<HTMLElement>("basicPanel");
const {
  activate: activateBasic,
  deactivate: deactivateBasic,
  isActive: basicActive,
} = useFocusTrap(basicPanel);

watch(basicOpen, async (v) => {
  if (v) {
    await nextTick();
    activateBasic();
  } else {
    deactivateBasic();
  }
});

/** initialFocus：先聚焦正文输入，而不是关闭按钮 */
const regionOpen = ref(false);
const regionRoot = useTemplateRef<HTMLElement>("regionRoot");
const regionBody = useTemplateRef<HTMLElement>("regionBody");
const {
  activate: activateRegion,
  deactivate: deactivateRegion,
  isActive: regionActive,
} = useFocusTrap(regionRoot, regionBody);

watch(regionOpen, async (v) => {
  if (v) {
    await nextTick();
    activateRegion();
  } else {
    deactivateRegion();
  }
});
</script>

<template>
  <div class="trap-demo">
    <header class="trap-demo__header">
      <h1>useFocusTrap</h1>
      <p>Tab / Shift+Tab 在面板内循环；关闭后焦点回到触发按钮。</p>
    </header>

    <section class="trap-demo__section">
      <h2>基础循环 <small>isActive: {{ basicActive }}</small></h2>
      <p class="trap-demo__hint">打开后按 Tab，焦点应只在面板内的控件间循环。</p>
      <button type="button" class="trap-demo__btn" @click="basicOpen = true">
        打开面板
      </button>

      <div
        v-show="basicOpen"
        ref="basicPanel"
        class="trap-demo__panel"
        tabindex="-1"
        role="dialog"
        aria-label="基础焦点陷阱演示"
      >
        <p class="trap-demo__panel-title">面板内容</p>
        <label class="trap-demo__field">
          姓名
          <input type="text" placeholder="输入姓名" />
        </label>
        <label class="trap-demo__field">
          备注
          <input type="text" placeholder="可选" />
        </label>
        <div class="trap-demo__actions">
          <button type="button" class="trap-demo__btn">确定</button>
          <button
            type="button"
            class="trap-demo__btn trap-demo__btn--muted"
            @click="basicOpen = false"
          >
            关闭
          </button>
        </div>
      </div>
    </section>

    <section class="trap-demo__section">
      <h2>initialFocus 区域 <small>isActive: {{ regionActive }}</small></h2>
      <p class="trap-demo__hint">
        传入正文 ref 作为 initialFocus，打开后应先聚焦「邮箱」输入，而不是右上角关闭按钮。
      </p>
      <button type="button" class="trap-demo__btn" @click="regionOpen = true">
        打开（避开关闭按钮）
      </button>

      <div
        v-show="regionOpen"
        ref="regionRoot"
        class="trap-demo__panel"
        tabindex="-1"
        role="dialog"
        aria-label="initialFocus 演示"
      >
        <div class="trap-demo__panel-bar">
          <span class="trap-demo__panel-title">编辑资料</span>
          <button
            type="button"
            class="trap-demo__btn trap-demo__btn--muted"
            aria-label="关闭"
            @click="regionOpen = false"
          >
            关闭
          </button>
        </div>
        <div ref="regionBody" class="trap-demo__body">
          <label class="trap-demo__field">
            邮箱
            <input type="email" placeholder="name@example.com" />
          </label>
          <button type="button" class="trap-demo__btn">提交</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.trap-demo {
  padding: 24px;
  max-width: 640px;
}

.trap-demo__header h1 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.trap-demo__header p {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.trap-demo__section {
  margin-bottom: 32px;
}

.trap-demo__section h2 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.trap-demo__section h2 small {
  margin-left: 8px;
  font-weight: 400;
  color: #9ca3af;
  font-size: 13px;
}

.trap-demo__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
}

.trap-demo__btn {
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

.trap-demo__btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.trap-demo__btn--muted {
  color: #6b7280;
  background: #f9fafb;
}

.trap-demo__panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px rgb(0 0 0 / 6%);
}

.trap-demo__panel:focus {
  outline: none;
}

.trap-demo__panel:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.trap-demo__panel-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.trap-demo__panel-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
}

.trap-demo__panel-bar .trap-demo__panel-title {
  margin: 0;
}

.trap-demo__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trap-demo__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #374151;
}

.trap-demo__field input {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.trap-demo__field input:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.trap-demo__actions {
  display: flex;
  gap: 8px;
}
</style>
