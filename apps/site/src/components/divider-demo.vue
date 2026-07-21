<script setup lang="ts">
import { Divider } from "vai";
</script>

<template>
  <div class="divider-demo">
    <header class="divider-demo__header">
      <h1>Divider</h1>
      <p>覆盖水平 / 垂直、主题色与线型的演示</p>
    </header>

    <section class="divider-demo__section">
      <h2>水平（默认）</h2>
      <p class="divider-demo__text">上方内容</p>
      <Divider />
      <p class="divider-demo__text">下方内容</p>
    </section>

    <section class="divider-demo__section">
      <h2>主题 theme</h2>
      <p class="divider-demo__hint">未指定 theme 时为灰色（control）</p>
      <Divider />
      <Divider theme="success" />
      <Divider theme="info" />
      <Divider theme="warn" />
      <Divider theme="error" />
      <Divider theme="dark" />
    </section>

    <section class="divider-demo__section">
      <h2>线型 border-style</h2>
      <p class="divider-demo__hint">solid（默认）</p>
      <Divider />
      <p class="divider-demo__hint">dashed</p>
      <Divider border-style="dashed" />
      <p class="divider-demo__hint">dotted</p>
      <Divider border-style="dotted" />
      <p class="divider-demo__hint">double</p>
      <Divider border-style="double" />
    </section>

    <section class="divider-demo__section">
      <h2>垂直 vertical</h2>
      <div class="divider-demo__row">
        <span>左侧</span>
        <Divider vertical />
        <span>中间</span>
        <Divider vertical theme="warn" border-style="dashed" />
        <span>右侧</span>
      </div>
      <Divider />
      <p class="divider-demo__hint">flex 容器内拉伸高度</p>
      <div class="divider-demo__tall-row">
        <span>上</span>
        <Divider vertical />
        <span>下</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.divider-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
  max-width: 640px;
}

.divider-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.divider-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.divider-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.divider-demo__text {
  margin: 0;
  color: #374151;
  font-size: 14px;
}

.divider-demo__hint {
  margin: 12px 0 4px;
  font-size: 13px;
  color: #6b7280;
}

.divider-demo__section>.divider-demo__hint:first-of-type {
  margin-top: 0;
}

.divider-demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  font-size: 14px;
  color: #374151;
}

.divider-demo__tall-row {
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 64px;
  margin-top: 12px;
  font-size: 14px;
  color: #374151;
}

.divider-demo__tall-row>span {
  display: flex;
  align-items: center;
}

.divider-demo__tall-row :deep(.v-vertical-divider) {
  align-self: stretch;
  height: auto;
}
</style>
