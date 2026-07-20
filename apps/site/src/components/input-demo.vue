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

const lineBasic = ref("");
const lineThemed = ref("hello");
const linePassword = ref("secret");
const lineCounted = ref("字符统计");
const lineClearable = ref("可清除内容");
const lineSuggest = ref("");
const lineAsyncSuggest = ref("");

const clearedLog = ref<string[]>([]);
const lineClearedLog = ref<string[]>([]);

function onCleared(label: string) {
  clearedLog.value = [...clearedLog.value, `cleared: ${label}`];
}

function onLineCleared(label: string) {
  lineClearedLog.value = [...lineClearedLog.value, `cleared: ${label}`];
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
          show-count
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

    <header class="input-demo__header input-demo__header--line">
      <h1>Input · line 变体</h1>
      <p>与上方示例一一对应；样式为下划线 + 浮动 label，功能保持一致</p>
    </header>

    <section class="input-demo__section">
      <h2>基础 / v-model（line）</h2>
      <Input v-model="lineBasic" variant="line" label="请输入内容" />
      <p class="input-demo__hint">值：{{ lineBasic || "(空)" }}</p>
    </section>

    <section class="input-demo__section">
      <h2>尺寸 size（line）</h2>
      <div class="input-demo__stack">
        <Input variant="line" size="sm" label="Small" />
        <Input variant="line" size="md" label="Medium" />
        <Input variant="line" size="lg" label="Large" />
      </div>
    </section>

    <section class="input-demo__section">
      <h2>主题 theme（line）</h2>
      <p class="input-demo__hint">未指定 theme 时使用 control 中性色；主题只影响边框与文字</p>
      <div class="input-demo__stack">
        <Input v-model="lineThemed" variant="line" label="Default / Control" />
        <Input variant="line" theme="success" label="Success" model-value="Success" />
        <Input variant="line" theme="info" label="Info" model-value="Info" />
        <Input variant="line" theme="warn" label="Warn" model-value="Warn" />
        <Input variant="line" theme="error" label="Error" model-value="Error" />
        <Input variant="line" theme="dark" label="Dark" model-value="Dark" />
      </div>
    </section>

    <section class="input-demo__section">
      <h2>前后缀 / 字数 / 密码（line）</h2>
      <div class="input-demo__stack">
        <Input variant="line" label="带前后缀">
          <template #prefix>
            <span class="input-demo__addon">@</span>
          </template>
          <template #suffix>
            <span class="input-demo__addon">.com</span>
          </template>
        </Input>
        <Input
          v-model="lineCounted"
          variant="line"
          label="字符统计"
          show-count
          maxlength="20"
        />
        <Input
          v-model="linePassword"
          variant="line"
          label="密码"
          password
        />
        <Input variant="line" label="禁用态" disabled model-value="禁用态" />
      </div>
    </section>

    <section class="input-demo__section">
      <h2>可清除 clearable / beforeClear（line）</h2>
      <div class="input-demo__stack">
        <Input
          v-model="lineClearable"
          variant="line"
          label="可清除"
          clearable
          @cleared="onLineCleared('default')"
        />
        <Input
          variant="line"
          label="拦截清除"
          model-value="拦截清除"
          clearable
          :before-clear="() => false"
          @cleared="onLineCleared('false')"
        />
        <Input
          variant="line"
          label="异步拦截"
          model-value="异步拦截"
          clearable
          :before-clear="promiseFalse"
          @cleared="onLineCleared('promise false')"
        />
      </div>
      <p class="input-demo__hint">
        事件日志：{{ lineClearedLog.join(" → ") || "尚未清除" }}
      </p>
    </section>

    <section class="input-demo__section">
      <h2>自动提示 pop-items（line）</h2>
      <p class="input-demo__hint">
        输入时 debounce 300ms 匹配；↑↓ 选择，Enter / Tab 确认
      </p>
      <div class="input-demo__stack">
        <Input
          v-model="lineSuggest"
          variant="line"
          label="输入水果名，如 ap"
          :pop-items="fruits"
        />
        <Input
          v-model="lineAsyncSuggest"
          variant="line"
          label="异步搜索库名，如 vi"
          :pop-items="searchLibs"
        />
      </div>
      <p class="input-demo__hint">
        suggest={{ lineSuggest || "(空)" }} / async={{ lineAsyncSuggest || "(空)" }}
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

.input-demo__header--line {
  margin-top: 24px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
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
