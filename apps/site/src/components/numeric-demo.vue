<script setup lang="ts">
import { ref } from "vue";
import { Numeric } from "vai";

const basic = ref(1);
const themed = ref(3);
const bounded = ref(5);
const looped = ref(0);
const withUnit = ref(1);
const noControls = ref(10);
const parsed = ref(Number.NaN);

const eventValue = ref(1);
const eventLog = ref<string[]>([]);

const apiValue = ref(5);
const numericRef = ref<InstanceType<typeof Numeric> | null>(null);

function parseWeight(str: string) {
  return Number(str.replace(/[^\d.-]/g, ""));
}

function formatNum(n: number) {
  return Number.isNaN(n) ? "NaN" : String(n);
}

function pushEvent(type: string, value: number) {
  eventLog.value = [`${type}:${formatNum(value)}`, ...eventLog.value].slice(
    0,
    8,
  );
}

function onInput(value: number) {
  pushEvent("input", value);
}

function onChange(value: number) {
  pushEvent("change", value);
}
</script>

<template>
  <div class="numeric-demo">
    <header class="numeric-demo__header">
      <h1>Numeric</h1>
      <p>数字输入：增减控件、单位、边界循环与粘贴解析</p>
    </header>

    <section class="numeric-demo__section">
      <h2>基础 / v-model</h2>
      <Numeric v-model="basic" />
      <p class="numeric-demo__hint">
        值：{{ Number.isNaN(basic) ? "NaN" : basic }}
      </p>
    </section>

    <section class="numeric-demo__section">
      <h2>尺寸 size</h2>
      <div class="numeric-demo__stack">
        <Numeric size="sm" :model-value="1" />
        <Numeric size="md" :model-value="1" />
        <Numeric size="lg" :model-value="1" />
      </div>
    </section>

    <section class="numeric-demo__section">
      <h2>主题 theme</h2>
      <p class="numeric-demo__hint">
        未指定 theme 时使用 control 中性色；主题只影响边框与文字
      </p>
      <div class="numeric-demo__stack">
        <Numeric v-model="themed" />
        <Numeric theme="success" :model-value="1" />
        <Numeric theme="info" :model-value="1" />
        <Numeric theme="warn" :model-value="1" />
        <Numeric theme="error" :model-value="1" />
        <Numeric theme="dark" :model-value="1" />
      </div>
    </section>

    <section class="numeric-demo__section">
      <h2>min / max / step</h2>
      <Numeric v-model="bounded" :min="0" :max="10" :step="0.5" />
      <p class="numeric-demo__hint">
        0 ~ 10，step=0.5；当前：{{ bounded }}
      </p>
    </section>

    <section class="numeric-demo__section">
      <h2>loop 循环</h2>
      <Numeric v-model="looped" loop :min="0" :max="3" :step="1" />
      <p class="numeric-demo__hint">
        到边界后跳到另一端；当前：{{ looped }}
      </p>
    </section>

    <section class="numeric-demo__section">
      <h2>unit 单位</h2>
      <p class="numeric-demo__hint">有单位时不显示 ± 按钮</p>
      <Numeric v-model="withUnit" unit="kg" :min="0" :step="1" />
      <p class="numeric-demo__hint">值：{{ withUnit }} kg</p>
    </section>

    <section class="numeric-demo__section">
      <h2>controls=false</h2>
      <Numeric v-model="noControls" :controls="false" :min="0" />
      <p class="numeric-demo__hint">仅输入框；当前：{{ noControls }}</p>
    </section>

    <section class="numeric-demo__section">
      <h2>parse 粘贴解析</h2>
      <p class="numeric-demo__hint">粘贴如「约 42 kg」会解析为 42</p>
      <Numeric v-model="parsed" :parse="parseWeight" :controls="false" />
      <p class="numeric-demo__hint">
        值：{{ Number.isNaN(parsed) ? "NaN" : parsed }}
      </p>
    </section>

    <section class="numeric-demo__section">
      <h2>input / change 事件</h2>
      <p class="numeric-demo__hint">
        键入触发 input；失焦触发 change；点 ± 同时触发两者
      </p>
      <Numeric
        v-model="eventValue"
        :min="0"
        :max="20"
        @input="onInput"
        @change="onChange"
      />
      <p class="numeric-demo__hint">
        值：{{ formatNum(eventValue) }}｜日志：{{
          eventLog.join(" → ") || "尚未触发"
        }}
      </p>
    </section>

    <section class="numeric-demo__section">
      <h2>Exposed Methods（api）</h2>
      <p class="numeric-demo__hint">
        通过 ref 调用 api.focus / blur / clear / setValue / selectall / increase
        / decrease
      </p>
      <Numeric
        ref="numericRef"
        v-model="apiValue"
        :min="0"
        :max="20"
        :step="1"
      />
      <div class="numeric-demo__actions">
        <button type="button" @click="numericRef?.api.focus()">focus</button>
        <button type="button" @click="numericRef?.api.blur()">blur</button>
        <button type="button" @click="numericRef?.api.selectall()">
          selectall
        </button>
        <button type="button" @click="numericRef?.api.increase()">
          increase
        </button>
        <button type="button" @click="numericRef?.api.decrease()">
          decrease
        </button>
        <button type="button" @click="numericRef?.api.setValue(10)">
          setValue(10)
        </button>
        <button type="button" @click="numericRef?.api.clear()">clear</button>
      </div>
      <p class="numeric-demo__hint">值：{{ formatNum(apiValue) }}</p>
    </section>

    <section class="numeric-demo__section">
      <h2>禁用 disabled</h2>
      <Numeric :model-value="7" disabled />
    </section>
  </div>
</template>

<style scoped>
.numeric-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
  max-width: 420px;
}

.numeric-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.numeric-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.numeric-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.numeric-demo__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.numeric-demo__hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: #6b7280;
  font-family: ui-monospace, Consolas, monospace;
}

.numeric-demo__section .numeric-demo__hint:first-of-type {
  margin: 0 0 12px;
  font-family: inherit;
}

.numeric-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.numeric-demo__actions button {
  appearance: none;
  padding: 4px 10px;
  font-size: 13px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
}

.numeric-demo__actions button:hover {
  background: #e5e7eb;
}
</style>
