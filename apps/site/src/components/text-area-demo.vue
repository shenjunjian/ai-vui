<script setup lang="ts">
import { ref } from "vue";
import { TextArea } from "vai";

const basic = ref("");
const themed = ref("主题色示例");
const counted = ref("字符统计示例");
const rowsFixed = ref("固定行数\n第二行\n第三行");
const autoSized = ref("自动高度：继续输入会在 minRows~maxRows 之间伸缩\n");
const apiDemo = ref("focus / blur / clear / selectall");
const textareaRef = ref<{
  api: {
    focus: () => void;
    blur: () => void;
    clear: () => void;
    selectall: () => void;
  };
} | null>(null);
</script>

<template>
  <div class="textarea-demo">
    <header class="textarea-demo__header">
      <h1>TextArea</h1>
      <p>覆盖尺寸、主题、字数、固定 rows、autoSize 与属性透传的演示</p>
    </header>

    <section class="textarea-demo__section">
      <h2>基础 / v-model</h2>
      <TextArea v-model="basic" placeholder="请输入多行内容" rows="3" />
      <p class="textarea-demo__hint">值：{{ basic || "(空)" }}</p>
    </section>

    <section class="textarea-demo__section">
      <h2>尺寸 size</h2>
      <div class="textarea-demo__stack">
        <TextArea size="sm" placeholder="Small" rows="2" />
        <TextArea size="md" placeholder="Medium" rows="2" />
        <TextArea size="lg" placeholder="Large" rows="2" />
      </div>
    </section>

    <section class="textarea-demo__section">
      <h2>主题 theme</h2>
      <p class="textarea-demo__hint">
        未指定 theme 时使用 control 中性色；主题只影响边框与文字
      </p>
      <div class="textarea-demo__stack">
        <TextArea v-model="themed" rows="2" />
        <TextArea theme="success" model-value="Success" rows="2" />
        <TextArea theme="info" model-value="Info" rows="2" />
        <TextArea theme="warn" model-value="Warn" rows="2" />
        <TextArea theme="error" model-value="Error" rows="2" />
        <TextArea theme="dark" model-value="Dark" rows="2" />
        <TextArea disabled model-value="禁用态" rows="2" />
      </div>
    </section>

    <section class="textarea-demo__section">
      <h2>字数 show-count</h2>
      <TextArea
        v-model="counted"
        show-count
        maxlength="50"
        rows="3"
        placeholder="右下角灰色字数"
      />
    </section>

    <section class="textarea-demo__section">
      <h2>透传属性：cols / rows / maxlength / minlength</h2>
      <p class="textarea-demo__hint">
        常见 textarea 属性经 inheritAttrs 落到内部元素
      </p>
      <TextArea
        v-model="rowsFixed"
        rows="4"
        cols="40"
        maxlength="200"
        minlength="2"
        name="bio"
        placeholder="rows=4 cols=40 maxlength=200"
      />
    </section>

    <section class="textarea-demo__section">
      <h2>CSS resize</h2>
      <p class="textarea-demo__hint">
        通过 style 控制 resize：both / vertical / horizontal / none
      </p>
      <div class="textarea-demo__stack">
        <TextArea
          model-value="resize: vertical"
          rows="3"
          style="resize: vertical"
        />
        <TextArea
          model-value="resize: horizontal"
          rows="3"
          style="resize: horizontal"
        />
        <TextArea model-value="resize: both" rows="3" style="resize: both" />
        <TextArea model-value="resize: none" rows="3" style="resize: none" />
      </div>
    </section>

    <section class="textarea-demo__section">
      <h2>autoSize</h2>
      <p class="textarea-demo__hint">
        minRows=2 / maxRows=6，随内容自动增高；超出后出现滚动条
      </p>
      <TextArea
        v-model="autoSized"
        :auto-size="{ minRows: 2, maxRows: 6 }"
        placeholder="自动高度"
      />
    </section>

    <section class="textarea-demo__section">
      <h2>Exposed API</h2>
      <TextArea ref="textareaRef" v-model="apiDemo" rows="3" />
      <div class="textarea-demo__actions">
        <button type="button" @click="textareaRef?.api.focus()">focus</button>
        <button type="button" @click="textareaRef?.api.blur()">blur</button>
        <button type="button" @click="textareaRef?.api.selectall()">
          selectall
        </button>
        <button type="button" @click="textareaRef?.api.clear()">clear</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.textarea-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
  max-width: 520px;
}

.textarea-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.textarea-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.textarea-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.textarea-demo__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.textarea-demo__hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: #6b7280;
  font-family: ui-monospace, Consolas, monospace;
}

.textarea-demo__section .textarea-demo__hint:first-of-type {
  margin: 0 0 12px;
  font-family: inherit;
}

.textarea-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.textarea-demo__actions button {
  appearance: none;
  padding: 6px 12px;
  font-size: 13px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
}
</style>
