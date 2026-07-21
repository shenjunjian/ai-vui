<script setup lang="ts">
import { ref } from "vue";
import AlertDemo from "./components/alert-demo.vue";
import ButtonDemo from "./components/button-demo.vue";
import CheckboxDemo from "./components/checkbox-demo.vue";
import DialogDemo from "./components/dialog-demo.vue";
import DividerDemo from "./components/divider-demo.vue";
import InputDemo from "./components/input-demo.vue";
import NumericDemo from "./components/numeric-demo.vue";
import LinkDemo from "./components/link-demo.vue";
import RadioDemo from "./components/radio-demo.vue";
import TagDemo from "./components/tag-demo.vue";
import TextAreaDemo from "./components/text-area-demo.vue";
import UsePopperDemo from "./components/use-popper-demo.vue";

const tab = ref<
  | "button"
  | "link"
  | "tag"
  | "alert"
  | "input"
  | "numeric"
  | "text-area"
  | "checkbox"
  | "radio"
  | "divider"
  | "dialog"
  | "use-popper"
>("dialog");
</script>

<template>
  <div class="site-app">
    <nav class="site-app__nav">
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'button' }"
        @click="tab = 'button'"
      >
        Button
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'link' }"
        @click="tab = 'link'"
      >
        Link
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'tag' }"
        @click="tab = 'tag'"
      >
        Tag
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'alert' }"
        @click="tab = 'alert'"
      >
        Alert
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'input' }"
        @click="tab = 'input'"
      >
        Input
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'numeric' }"
        @click="tab = 'numeric'"
      >
        Numeric
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'text-area' }"
        @click="tab = 'text-area'"
      >
        TextArea
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'checkbox' }"
        @click="tab = 'checkbox'"
      >
        Checkbox
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'radio' }"
        @click="tab = 'radio'"
      >
        Radio
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'divider' }"
        @click="tab = 'divider'"
      >
        Divider
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'dialog' }"
        @click="tab = 'dialog'"
      >
        Dialog
      </button>
      <button
        type="button"
        class="site-app__tab"
        :class="{ 'is-active': tab === 'use-popper' }"
        @click="tab = 'use-popper'"
      >
        usePopper
      </button>
    </nav>
    <ButtonDemo v-if="tab === 'button'" />
    <LinkDemo v-else-if="tab === 'link'" />
    <TagDemo v-else-if="tab === 'tag'" />
    <AlertDemo v-else-if="tab === 'alert'" />
    <InputDemo v-else-if="tab === 'input'" />
    <NumericDemo v-else-if="tab === 'numeric'" />
    <TextAreaDemo v-else-if="tab === 'text-area'" />
    <CheckboxDemo v-else-if="tab === 'checkbox'" />
    <RadioDemo v-else-if="tab === 'radio'" />
    <DividerDemo v-else-if="tab === 'divider'" />
    <DialogDemo v-else-if="tab === 'dialog'" />
    <UsePopperDemo v-else />
  </div>
</template>

<style scoped>
.site-app__nav {
  display: flex;
  gap: 8px;
  padding: 16px 24px 0;
}

.site-app__tab {
  appearance: none;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
}

.site-app__tab.is-active {
  color: #1f2937;
  background: #fff;
  border-color: #d1d5db;
}
</style>
