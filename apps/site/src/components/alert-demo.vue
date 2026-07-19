<script setup lang="ts">
import { ref } from "vue";
import { Alert } from "vai";

const closedLog = ref<string[]>([]);

function onClosed(label: string) {
  closedLog.value = [...closedLog.value, `closed: ${label}`];
}

const promiseFalse = () =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000));
const promiseTrue = () =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1000));
</script>

<template>
  <div class="alert-demo">
    <header class="alert-demo__header">
      <h1>Alert</h1>
      <p>覆盖尺寸、主题、图标、可关闭与 beforeClose 拦截的完整演示</p>
    </header>

    <section class="alert-demo__section">
      <h2>尺寸 size</h2>
      <div class="alert-demo__stack">
        <Alert size="sm">Small Alert</Alert>
        <Alert size="md">Medium Alert</Alert>
        <Alert size="lg">Large Alert</Alert>
      </div>
    </section>

    <section class="alert-demo__section">
      <h2>主题 theme</h2>
      <p class="alert-demo__hint">未指定 theme 时使用 control 中性色</p>
      <div class="alert-demo__stack">
        <Alert>Default / Control</Alert>
        <Alert theme="success">Success Alert</Alert>
        <Alert theme="info">Info Alert</Alert>
        <Alert theme="warn">Warn Alert</Alert>
        <Alert theme="error">Error Alert</Alert>
        <Alert theme="dark">Dark Alert</Alert>
      </div>
    </section>

    <section class="alert-demo__section">
      <h2>图标 showIcon / icon 插槽</h2>
      <div class="alert-demo__stack">
        <Alert theme="info">默认显示状态图标</Alert>
        <Alert theme="warn" :show-icon="false">隐藏图标</Alert>
        <Alert theme="success">
          <template #icon>
            <span class="alert-demo__icon" aria-hidden="true">★</span>
          </template>
          自定义 icon 插槽
        </Alert>
      </div>
    </section>

    <section class="alert-demo__section">
      <h2>可关闭 closable / beforeClose</h2>
      <div class="alert-demo__stack">
        <Alert closable @closed="onClosed('Default')">不绑定 beforeClose</Alert>
        <Alert
          theme="error"
          closable
          :before-close="() => false"
          @closed="onClosed('false')"
        >
          beforeClose → false（拦截）
        </Alert>
        <Alert
          theme="warn"
          closable
          :before-close="promiseFalse"
          @closed="onClosed('promise false')"
        >
          beforeClose → Promise&lt;false&gt;（拦截）
        </Alert>
        <Alert
          theme="success"
          closable
          :before-close="() => true"
          @closed="onClosed('true')"
        >
          beforeClose → true（允许）
        </Alert>
        <Alert
          theme="info"
          closable
          :before-close="promiseTrue"
          @closed="onClosed('promise true')"
        >
          beforeClose → Promise&lt;true&gt;（允许）
        </Alert>
        <Alert theme="dark" closable @closed="onClosed('custom close')">
          <template #close>
            <span>关</span>
          </template>
          自定义 close 插槽
        </Alert>
      </div>
      <p class="alert-demo__hint">
        事件日志：{{ closedLog.join(" → ") || "尚未关闭" }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.alert-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
}

.alert-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.alert-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.alert-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.alert-demo__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-demo__hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: #6b7280;
  font-family: ui-monospace, Consolas, monospace;
}

.alert-demo__section .alert-demo__hint:first-of-type {
  margin: 0 0 12px;
  font-family: inherit;
}

.alert-demo__icon {
  display: inline-flex;
  font-size: 0.9em;
  line-height: 1;
}
</style>
