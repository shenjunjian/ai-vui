<script setup lang="ts">
import { useScrollLock } from "vai";

const { lock, unlock, isLocked } = useScrollLock();
</script>

<template>
  <div class="scroll-lock-demo">
    <header class="scroll-lock-demo__header">
      <h1>useScrollLock</h1>
      <p>
        用 <code>position: fixed</code> + <code>top: -scrollY</code> 冻结当前视口，避免
        <code>overflow: hidden</code> 把页面甩回顶部；并按实际腾出的滚动条宽度补偿
        <code>body.padding-right</code>。
      </p>
    </header>

    <section class="scroll-lock-demo__section">
      <h2>基础锁定 <small>isLocked: {{ isLocked }}</small></h2>
      <p class="scroll-lock-demo__hint">
        先向下滚一段，再点「锁定」：页面应停在当前位置无法继续滚，且不闪回顶部；点「解锁」回到可滚状态且仍在原位置。
      </p>
      <div class="scroll-lock-demo__actions">
        <button type="button" class="scroll-lock-demo__btn" @click="lock">
          锁定滚动
        </button>
        <button
          type="button"
          class="scroll-lock-demo__btn scroll-lock-demo__btn--muted"
          @click="unlock"
        >
          解锁
        </button>
      </div>
    </section>

    <section class="scroll-lock-demo__filler" aria-hidden="true">
      <p v-for="n in 40" :key="n">占位行 {{ n }} — 用于产生页面滚动条</p>
    </section>
  </div>
</template>

<style scoped>
.scroll-lock-demo {
  padding: 24px;
  max-width: 640px;
}

.scroll-lock-demo__header h1 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.scroll-lock-demo__header p {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.scroll-lock-demo__section {
  margin-bottom: 24px;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 12px 0;
  background: #fff;
}

.scroll-lock-demo__section h2 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.scroll-lock-demo__section h2 small {
  margin-left: 8px;
  font-weight: 400;
  color: #9ca3af;
  font-size: 13px;
}

.scroll-lock-demo__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
}

.scroll-lock-demo__actions {
  display: flex;
  gap: 8px;
}

.scroll-lock-demo__btn {
  appearance: none;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
}

.scroll-lock-demo__btn--muted {
  color: #6b7280;
  background: #f9fafb;
}

.scroll-lock-demo__filler p {
  margin: 0;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  color: #9ca3af;
  font-size: 13px;
}
</style>
