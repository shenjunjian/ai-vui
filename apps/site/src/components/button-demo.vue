<script setup lang="ts">
import { ref } from "vue";
import { Button } from "vai";

const pressed = ref(false);
const iconPressed = ref(false);
const loading = ref(false);
const clickCount = ref(0);

function handleDemoClick() {
  clickCount.value += 1;
}

function toggleLoading() {
  loading.value = true;
  window.setTimeout(() => {
    loading.value = false;
  }, 2000);
}
</script>

<template>
  <div class="button-demo">
    <header class="button-demo__header">
      <h1>Button</h1>
      <p>覆盖尺寸、主题、变体、状态与行为的完整演示</p>
    </header>

    <section class="button-demo__section">
      <h2>尺寸 size</h2>
      <div class="button-demo__row">
        <Button size="sm" @click="handleDemoClick">Small</Button>
        <Button size="md" @click="handleDemoClick">Medium</Button>
        <Button size="lg" @click="handleDemoClick">Large</Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>主题 theme</h2>
      <div class="button-demo__row">
        <Button @click="handleDemoClick">Default</Button>
        <Button theme="success" @click="handleDemoClick">Success</Button>
        <Button theme="info" @click="handleDemoClick">Info</Button>
        <Button theme="warn" @click="handleDemoClick">Warn</Button>
        <Button theme="error" @click="handleDemoClick">Error</Button>
        <Button theme="dark" @click="handleDemoClick">Dark</Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>朴素 plain</h2>
      <div class="button-demo__row">
        <Button theme="success" plain @click="handleDemoClick">Success</Button>
        <Button theme="info" plain @click="handleDemoClick">Info</Button>
        <Button theme="warn" plain @click="handleDemoClick">Warn</Button>
        <Button theme="error" plain @click="handleDemoClick">Error</Button>
        <Button theme="dark" plain @click="handleDemoClick">Dark</Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>幽灵 ghost</h2>
      <div class="button-demo__row button-demo__row--contrast">
        <Button ghost @click="handleDemoClick">Default</Button>
        <Button theme="success" ghost @click="handleDemoClick">Success</Button>
        <Button theme="info" ghost @click="handleDemoClick">Info</Button>
        <Button theme="warn" ghost @click="handleDemoClick">Warn</Button>
        <Button theme="error" ghost @click="handleDemoClick">Error</Button>
        <Button theme="dark" ghost @click="handleDemoClick">Dark</Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>变体 variant</h2>
      <div class="button-demo__row">
        <Button variant="button" @click="handleDemoClick">Button</Button>
        <Button variant="text" @click="handleDemoClick">Text</Button>
        <Button variant="link" @click="handleDemoClick">Link</Button>
        <Button variant="icon" aria-label="图标按钮" @click="handleDemoClick">
          ★
        </Button>
        <Button variant="text" theme="info" @click="handleDemoClick">Text Info</Button>
        <Button variant="link" theme="error" @click="handleDemoClick">Link Error</Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>圆形 circle</h2>
      <div class="button-demo__row">
        <Button circle @click="handleDemoClick">Pill</Button>
        <Button theme="info" circle @click="handleDemoClick">Info</Button>
        <Button variant="icon" circle aria-label="圆形图标" @click="handleDemoClick">
          ★
        </Button>
        <Button variant="icon" aria-label="方形图标" @click="handleDemoClick">★</Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>禁用 disabled</h2>
      <div class="button-demo__row">
        <Button disabled>Disabled</Button>
        <Button theme="success" disabled>Success</Button>
        <Button theme="info" disabled>Success</Button>
        <Button theme="warn" disabled>Plain</Button>
        <Button theme="error" disabled>Plain</Button>
        <Button variant="text" disabled>Text</Button>
        <Button variant="icon" disabled aria-label="禁用图标">★</Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>加载 loading</h2>
      <div class="button-demo__row">
        <Button :loading="loading" @click="toggleLoading">
          {{ loading ? "加载中…" : "点击加载 2s" }}
        </Button>
        <Button theme="info" loading>Loading</Button>
        <Button theme="success" plain loading>Plain Loading</Button>
        <Button variant="icon" loading aria-label="加载图标">↻</Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>切换 toggleMode + pressed</h2>
      <div class="button-demo__row">
        <Button v-model:pressed="pressed" toggle-mode>
          {{ pressed ? "已选中" : "未选中" }}
        </Button>
        <Button v-model:pressed="iconPressed" variant="icon" circle toggle-mode aria-label="切换图标">
          {{ iconPressed ? "●" : "○" }}
        </Button>
        <Button theme="info" toggle-mode :pressed="true">预选中</Button>
        <Button
          v-model:pressed="pressed"
          theme="warn"
          toggle-mode
          :reset-time="3000"
        >
          toggle 忽略 resetTime
        </Button>
      </div>
      <p class="button-demo__hint">
        pressed: {{ pressed }} / iconPressed: {{ iconPressed }}（可连续点击，不受 resetTime 冷却）
      </p>
    </section>

    <section class="button-demo__section">
      <h2>防重复点击 resetTime</h2>
      <div class="button-demo__row">
        <Button :reset-time="1000" @click="handleDemoClick">默认 1s 冷却</Button>
        <Button theme="warn" :reset-time="3000" @click="handleDemoClick">
          3s 冷却
        </Button>
        <Button theme="success" :reset-time="0" @click="handleDemoClick">
          关闭冷却
        </Button>
      </div>
      <p class="button-demo__hint">
        点击次数：{{ clickCount }}（仅非 toggleMode 生效；连续点击会被冷却拦截）
      </p>
    </section>

    <section class="button-demo__section">
      <h2>插槽 slot（图标 + 文案）</h2>
      <div class="button-demo__row">
        <Button theme="info" @click="handleDemoClick">
          <span class="button-demo__icon" aria-hidden="true">↑</span>
          上传
        </Button>
        <Button theme="success" plain @click="handleDemoClick">
          <span class="button-demo__icon" aria-hidden="true">✓</span>
          确认
        </Button>
        <Button variant="text" @click="handleDemoClick">
          <span class="button-demo__icon" aria-hidden="true">⚙</span>
          设置
        </Button>
      </div>
    </section>

    <section class="button-demo__section">
      <h2>组合示例</h2>
      <div class="button-demo__row">
        <Button size="sm" theme="error" plain circle @click="handleDemoClick">
          小朴素
        </Button>
        <Button size="lg" theme="success" ghost circle @click="handleDemoClick">
          大幽灵
        </Button>
        <Button size="sm" variant="icon" theme="warn" circle @click="handleDemoClick" aria-label="警告">
          !
        </Button>
        <Button size="lg" theme="dark" loading>Dark Loading</Button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.button-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
}

.button-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.button-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.button-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.button-demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.button-demo__row--contrast {
  padding: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e2e2e2, #cedbf1);
}

.button-demo__hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: #6b7280;
  font-family: ui-monospace, Consolas, monospace;
}

.button-demo__icon {
  display: inline-flex;
  font-size: 14px;
  line-height: 1;
}
</style>
