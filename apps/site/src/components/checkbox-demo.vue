<script setup lang="ts">
import { ref } from "vue";
import { Checkbox, Button } from "vai";

const basic = ref(false);
const sized = ref(true);
const withLabel = ref(true);
const slotLabel = ref(false);
const half = ref(false);
const halfOn = ref(true);
const disabledOn = ref(true);
const disabledOff = ref(false);

const changeDemo = ref(false);
const changeLog = ref<string[]>([]);

const apiDemo = ref(false);
const checkboxRef = ref<{
  api: {
    focus: () => void;
    blur: () => void;
    setCheck: (value: boolean) => void;
  };
} | null>(null);

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  changeLog.value = [
    ...changeLog.value,
    `change: checked=${target.checked}`,
  ].slice(-5);
}
</script>

<template>
  <div class="checkbox-demo">
    <header class="checkbox-demo__header">
      <h1>Checkbox</h1>
      <p>覆盖尺寸、主题、label、半选、禁用、change、属性透传与 api 的演示</p>
    </header>

    <section class="checkbox-demo__section">
      <h2>基础 / v-model:checked</h2>
      <Checkbox v-model:checked="basic" label="基础复选框" />
      <p class="checkbox-demo__hint">checked：{{ basic }}</p>
    </section>

    <section class="checkbox-demo__section">
      <h2>尺寸 size</h2>
      <div class="checkbox-demo__row">
        <Checkbox size="sm" label="Small" />
        <Checkbox v-model:checked="sized" size="md" label="Medium" />
        <Checkbox size="lg" label="Large" />
      </div>
    </section>

    <section class="checkbox-demo__section">
      <h2>主题 theme</h2>
      <p class="checkbox-demo__hint">
        未指定 theme 时使用 control 中性色；主题影响图标与焦点光晕
      </p>
      <div class="checkbox-demo__row">
        <Checkbox checked label="Default" />
        <Checkbox theme="success" checked label="Success" />
        <Checkbox theme="info" checked label="Info" />
        <Checkbox theme="warn" checked label="Warn" />
        <Checkbox theme="error" checked label="Error" />
        <Checkbox theme="dark" checked label="Dark" />
      </div>
    </section>

    <section class="checkbox-demo__section">
      <h2>label / 默认插槽</h2>
      <div class="checkbox-demo__stack">
        <Checkbox v-model:checked="withLabel" label="使用 label 属性" />
        <Checkbox v-model:checked="slotLabel">
          使用 <strong>默认插槽</strong> 自定义内容
        </Checkbox>
        <Checkbox />
        <p class="checkbox-demo__hint">无文本时仅显示勾选框</p>
      </div>
    </section>

    <section class="checkbox-demo__section">
      <h2>半选 indeterminate</h2>
      <p class="checkbox-demo__hint">
        indeterminate 为 true 时优先显示半选，与 checked 无关
      </p>
      <div class="checkbox-demo__stack">
        <Checkbox
          v-model:checked="half"
          indeterminate
          label="半选（checked=false）"
        />
        <Checkbox
          v-model:checked="halfOn"
          indeterminate
          label="半选（checked=true）"
        />
        <Checkbox
          :checked="false"
          :indeterminate="false"
          label="未选中对照"
        />
        <Checkbox :checked="true" label="已选中对照" />
      </div>
    </section>

    <section class="checkbox-demo__section">
      <h2>禁用 disabled</h2>
      <div class="checkbox-demo__row">
        <Checkbox v-model:checked="disabledOff" disabled label="禁用未选" />
        <Checkbox v-model:checked="disabledOn" disabled label="禁用已选" />
      </div>
    </section>

    <section class="checkbox-demo__section">
      <h2>事件 change</h2>
      <p class="checkbox-demo__hint">
        原生 change 经属性透传到内部 input；可与 v-model:checked 同时使用
      </p>
      <Checkbox
        v-model:checked="changeDemo"
        label="切换我触发 change"
        @change="onChange"
      />
      <p class="checkbox-demo__hint">
        checked：{{ changeDemo }}；事件日志：{{
          changeLog.join(" → ") || "尚未触发"
        }}
      </p>
    </section>

    <section class="checkbox-demo__section">
      <h2>透传属性 name / value / id</h2>
      <form class="checkbox-demo__stack" @submit.prevent>
        <Checkbox
          v-model:checked="basic"
          name="agree"
          value="yes"
          id="demo-agree"
          label="同意条款（name=agree）"
        />
      </form>
    </section>

    <section class="checkbox-demo__section">
      <h2>api：focus / blur / setCheck</h2>
      <Checkbox
        ref="checkboxRef"
        v-model:checked="apiDemo"
        label="可被 api 控制"
      />
      <div class="checkbox-demo__row">
        <Button size="sm" @click="checkboxRef?.api.focus()">focus</Button>
        <Button size="sm" @click="checkboxRef?.api.blur()">blur</Button>
        <Button size="sm" @click="checkboxRef?.api.setCheck(true)">
          setCheck(true)
        </Button>
        <Button size="sm" @click="checkboxRef?.api.setCheck(false)">
          setCheck(false)
        </Button>
      </div>
      <p class="checkbox-demo__hint">checked：{{ apiDemo }}</p>
    </section>
  </div>
</template>

<style scoped>
.checkbox-demo {
  padding: 24px;
  max-width: 720px;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #1f2937;
}

.checkbox-demo__header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
}

.checkbox-demo__header p {
  margin: 0 0 24px;
  color: #6b7280;
}

.checkbox-demo__section {
  margin-bottom: 28px;
}

.checkbox-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
}

.checkbox-demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.checkbox-demo__stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.checkbox-demo__hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6b7280;
}
</style>
