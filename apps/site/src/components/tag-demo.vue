<script setup lang="ts">
import { ref } from "vue";
import { Tag } from "vai";

const closedLog = ref<string[]>([]);
const confirmClose = ref(true);

function beforeClose(label: string) {
  closedLog.value = [...closedLog.value, `beforeClose: ${label}`];
  return confirmClose.value;
}

function onClosed(label: string) {
  closedLog.value = [...closedLog.value, `closed: ${label}`];
}

const promiseFalse = () => new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000))
const promiseTrue = () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1000))
</script>

<template>
  <div class="tag-demo">
    <header class="tag-demo__header">
      <h1>Tag</h1>
      <p>覆盖尺寸、主题、朴素、圆形、禁用与可关闭的完整演示</p>
    </header>

    <section class="tag-demo__section">
      <h2>尺寸 size</h2>
      <div class="tag-demo__row">
        <Tag size="sm">Small</Tag>
        <Tag size="md">Medium</Tag>
        <Tag size="lg">Large</Tag>
      </div>
    </section>

    <section class="tag-demo__section">
      <h2>主题 theme</h2>
      <p class="tag-demo__hint">
        无主题时为 control 中性色（浅灰底）；指定 theme 后色值与 Button 一致（高亮语义用 Info）
      </p>
      <div class="tag-demo__row">
        <Tag>Default</Tag>
        <Tag theme="success">Success</Tag>
        <Tag theme="info">Info</Tag>
        <Tag theme="warn">Warn</Tag>
        <Tag theme="error">Error</Tag>
        <Tag theme="dark">Dark</Tag>
      </div>
    </section>

    <section class="tag-demo__section">
      <h2>朴素 plain</h2>
      <div class="tag-demo__row">
        <Tag theme="success" plain>Success</Tag>
        <Tag theme="info" plain>Info</Tag>
        <Tag theme="warn" plain>Warn</Tag>
        <Tag theme="error" plain>Error</Tag>
        <Tag theme="dark" plain>Dark</Tag>
      </div>
    </section>

    <section class="tag-demo__section">
      <h2>圆形 circle</h2>
      <div class="tag-demo__row">
        <Tag circle>Default</Tag>
        <Tag theme="info" circle>Info</Tag>
        <Tag theme="success" plain circle>Plain</Tag>
      </div>
    </section>

    <section class="tag-demo__section">
      <h2>禁用 disabled</h2>
      <div class="tag-demo__row">
        <Tag disabled>Disabled</Tag>
        <Tag theme="success" disabled>Success</Tag>
        <Tag theme="info" plain disabled>Info Plain</Tag>
        <Tag closable disabled>Closable</Tag>
      </div>
    </section>

    <section class="tag-demo__section">
      <h2>可关闭 closable</h2>
      <label class="tag-demo__hint">
        <input v-model="confirmClose" type="checkbox" />
        beforeClose 返回 true（取消勾选可拦截关闭）
      </label>
      <div class="tag-demo__row">
        <Tag closable @closed="onClosed('Default')">
          不绑定beforeClose
        </Tag>
        <Tag theme="error" plain closable circle :before-close="() => false" @closed="onClosed('Error')">
          beforeClose 绑定 function->false
        </Tag>
        <Tag theme="error" plain closable circle :before-close="promiseFalse" @closed="onClosed('Error')">
          beforeClose 绑定 function->Promise< false>
        </Tag>

        <Tag theme="error" plain closable circle :before-close="() => true" @closed="onClosed('Error')">
          beforeClose 绑定 function->true
        </Tag>
        <Tag theme="error" plain closable circle :before-close="promiseTrue" @closed="onClosed('Error')">
          beforeClose 绑定 function->Promise< true>
        </Tag>
      </div>
      <p class="tag-demo__hint">事件日志：{{ closedLog.join(" → ") || "尚未关闭" }}</p>
    </section>

    <section class="tag-demo__section">
      <h2>插槽（图标 + 文案）</h2>
      <div class="tag-demo__row">
        <Tag theme="info">
          <span class="tag-demo__icon" aria-hidden="true">★</span>
          精选
        </Tag>
        <Tag theme="success" plain>
          <span class="tag-demo__icon" aria-hidden="true">✓</span>
          已通过
        </Tag>
        <Tag>
          <span class="tag-demo__icon" aria-hidden="true">⚙</span>
          配置
        </Tag>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tag-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
}

.tag-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.tag-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.tag-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.tag-demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.tag-demo__hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: #6b7280;
  font-family: ui-monospace, Consolas, monospace;
}

.tag-demo__section .tag-demo__hint:first-of-type {
  margin: 0 0 12px;
  font-family: inherit;
}

.tag-demo__icon {
  display: inline-flex;
  font-size: 0.9em;
  line-height: 1;
}
</style>
