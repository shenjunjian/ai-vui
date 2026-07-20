<script setup lang="ts">
import { ref } from "vue";
import { Radio, Button } from "vai";

const basic = ref(false);
const sized = ref(true);
const withLabel = ref(true);
const slotLabel = ref(false);
const disabledOn = ref(true);
const disabledOff = ref(false);

const fruit = ref<"apple" | "banana" | "orange">("apple");

const apiDemo = ref(false);
const radioRef = ref<{
  api: {
    focus: () => void;
    blur: () => void;
    setCheck: (value: boolean) => void;
  };
} | null>(null);

function selectFruit(value: "apple" | "banana" | "orange") {
  fruit.value = value;
}
</script>

<template>
  <div class="radio-demo">
    <header class="radio-demo__header">
      <h1>Radio</h1>
      <p>覆盖尺寸、label、禁用、同组 name、属性透传与 api 的演示</p>
    </header>

    <section class="radio-demo__section">
      <h2>基础 / v-model:checked</h2>
      <Radio v-model:checked="basic" label="基础单选框" />
      <p class="radio-demo__hint">checked：{{ basic }}</p>
    </section>

    <section class="radio-demo__section">
      <h2>尺寸 size</h2>
      <div class="radio-demo__row">
        <Radio size="sm" label="Small" />
        <Radio v-model:checked="sized" size="md" label="Medium" />
        <Radio size="lg" label="Large" />
      </div>
    </section>

    <section class="radio-demo__section">
      <h2>label / 默认插槽</h2>
      <div class="radio-demo__stack">
        <Radio v-model:checked="withLabel" label="使用 label 属性" />
        <Radio v-model:checked="slotLabel">
          使用 <strong>默认插槽</strong> 自定义内容
        </Radio>
        <Radio />
        <p class="radio-demo__hint">无文本时仅显示单选框</p>
      </div>
    </section>

    <section class="radio-demo__section">
      <h2>同组互斥（name + value）</h2>
      <p class="radio-demo__hint">
        透传原生 name/value；用 checked 与选中值同步（RadioGroup 落地前的用法）
      </p>
      <div class="radio-demo__stack">
        <Radio
          name="fruit"
          value="apple"
          :checked="fruit === 'apple'"
          label="苹果"
          @update:checked="(v) => v && selectFruit('apple')"
        />
        <Radio
          name="fruit"
          value="banana"
          :checked="fruit === 'banana'"
          label="香蕉"
          @update:checked="(v) => v && selectFruit('banana')"
        />
        <Radio
          name="fruit"
          value="orange"
          :checked="fruit === 'orange'"
          label="橙子"
          @update:checked="(v) => v && selectFruit('orange')"
        />
      </div>
      <p class="radio-demo__hint">选中：{{ fruit }}</p>
    </section>

    <section class="radio-demo__section">
      <h2>禁用 disabled</h2>
      <div class="radio-demo__row">
        <Radio v-model:checked="disabledOff" disabled label="禁用未选" />
        <Radio v-model:checked="disabledOn" disabled label="禁用已选" />
      </div>
    </section>

    <section class="radio-demo__section">
      <h2>透传属性 name / value / id</h2>
      <form class="radio-demo__stack" @submit.prevent>
        <Radio
          v-model:checked="basic"
          name="plan"
          value="pro"
          id="demo-plan"
          label="专业版（name=plan）"
        />
      </form>
    </section>

    <section class="radio-demo__section">
      <h2>api：focus / blur / setCheck</h2>
      <Radio ref="radioRef" v-model:checked="apiDemo" label="可被 api 控制" />
      <div class="radio-demo__row">
        <Button size="sm" @click="radioRef?.api.focus()">focus</Button>
        <Button size="sm" @click="radioRef?.api.blur()">blur</Button>
        <Button size="sm" @click="radioRef?.api.setCheck(true)">
          setCheck(true)
        </Button>
        <Button size="sm" @click="radioRef?.api.setCheck(false)">
          setCheck(false)
        </Button>
      </div>
      <p class="radio-demo__hint">checked：{{ apiDemo }}</p>
    </section>
  </div>
</template>

<style scoped>
.radio-demo {
  padding: 24px;
  max-width: 720px;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #1f2937;
}

.radio-demo__header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
}

.radio-demo__header p {
  margin: 0 0 24px;
  color: #6b7280;
}

.radio-demo__section {
  margin-bottom: 28px;
}

.radio-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
}

.radio-demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.radio-demo__stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.radio-demo__hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6b7280;
}
</style>
