<script setup lang="ts">
import { ref } from "vue";
import ButtonDemo from "./components/button-demo.vue";
import LinkDemo from "./components/link-demo.vue";
import TagDemo from "./components/tag-demo.vue";

const tab = ref<"button" | "link" | "tag">("tag");
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
    </nav>
    <ButtonDemo v-if="tab === 'button'" />
    <LinkDemo v-else-if="tab === 'link'" />
    <TagDemo v-else />
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
