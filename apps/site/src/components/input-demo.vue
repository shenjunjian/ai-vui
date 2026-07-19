<script setup lang="ts">
import { ref } from "vue";
import { Input } from "vai";

const basic = ref("");
const themed = ref("hello");
const password = ref("secret");
const counted = ref("字符统计");
const clearable = ref("可清除内容");
const suggest = ref("");
const asyncSuggest = ref("");

const clearedLog = ref<string[]>([]);

function onCleared(label: string) {
  clearedLog.value = [...clearedLog.value, `cleared: ${label}`];
}

const fruits = ["apple", "apricot", "banana", "blueberry", "cherry", "grape"];

async function searchLibs(query: string) {
  await new Promise((r) => setTimeout(r, 200));
  return ["Vue", "Vite", "Vitest", "VueUse", "Pinia"].filter((x) =>
    x.toLowerCase().includes(query.toLowerCase()),
  );
}

const promiseFalse = () =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 500));
</script>

<template>
  <div class="input-demo">
    <header class="input-demo__header">
      <h1>Input</h1>
      <p>覆盖尺寸、主题、密码、清除、字数与自动提示的完整演示</p>
    </header>

    <section class="input-demo__section">
      <h2>基础 / v-model</h2>
      <Input v-model="basic" placeholder="请输入内容" />
      <p class="input-demo__hint">值：{{ basic || "(空)" }}</p>
    </section>

    <section class="input-demo__section">
      <h2>尺寸 size</h2>
      <div class="input-demo__stack">
        <Input size="sm" placeholder="Small" />
        <Input size="md" placeholder="Medium" />
        <Input size="lg" placeholder="Large" />
      </div>
    </section>

    <section class="input-demo__section">
      <h2>主题 theme</h2>
      <p class="input-demo__hint">未指定 theme 时使用 control 中性色；主题只影响边框与文字</p>
      <div class="input-demo__stack">
        <Input v-model="themed" placeholder="Default / Control" />
        <Input theme="success" model-value="Success" />
        <Input theme="info" model-value="Info" />
        <Input theme="warn" model-value="Warn" />
        <Input theme="error" model-value="Error" />
        <Input theme="dark" model-value="Dark" />
      </div>
    </section>

    <section class="input-demo__section">
      <h2>前后缀 / 字数 / 密码</h2>
      <div class="input-demo__stack">
        <Input placeholder="带前后缀">
          <template #prefix>
            <span class="input-demo__addon">@</span>
          </template>
          <template #suffix>
            <span class="input-demo__addon">.com</span>
          </template>
        </Input>
        <Input
          v-model="counted"
          char-count
          maxlength="20"
          placeholder="字符统计"
        />
        <Input v-model="password" password placeholder="密码" />
        <Input disabled model-value="禁用态" />
      </div>
    </section>

    <section class="input-demo__section">
      <h2>可清除 clearable / beforeClear</h2>
      <div class="input-demo__stack">
        <Input
          v-model="clearable"
          clearable
          placeholder="可清除"
          @cleared="onCleared('default')"
        />
        <Input
          model-value="拦截清除"
          clearable
          :before-clear="() => false"
          @cleared="onCleared('false')"
        />
        <Input
          model-value="异步拦截"
          clearable
          :before-clear="promiseFalse"
          @cleared="onCleared('promise false')"
        />
      </div>
      <p class="input-demo__hint">
        事件日志：{{ clearedLog.join(" → ") || "尚未清除" }}
      </p>
    </section>

    <section class="input-demo__section">
      <h2>自动提示 pop-items</h2>
      <p class="input-demo__hint">
        输入时 debounce 300ms 匹配；↑↓ 选择，Enter / Tab 确认
      </p>
      <div class="input-demo__stack">
        <Input
          v-model="suggest"
          :pop-items="fruits"
          placeholder="输入水果名，如 ap"
        />
        <Input
          v-model="asyncSuggest"
          :pop-items="searchLibs"
          placeholder="异步搜索库名，如 vi"
        />
      </div>
      <p class="input-demo__hint">
        suggest={{ suggest || "(空)" }} / async={{ asyncSuggest || "(空)" }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.input-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
  max-width: 480px;
}

.input-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.input-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.input-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.input-demo__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-demo__hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: #6b7280;
  font-family: ui-monospace, Consolas, monospace;
}

.input-demo__section .input-demo__hint:first-of-type {
  margin: 0 0 12px;
  font-family: inherit;
}

.input-demo__addon {
  font-size: 0.9em;
  line-height: 1;
  opacity: 0.75;
}
</style>
