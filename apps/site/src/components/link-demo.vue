<script setup lang="ts">
import { Link } from "vai";
</script>

<template>
  <div class="link-demo">
    <header class="link-demo__header">
      <h1>Link</h1>
      <p>覆盖尺寸、主题、下划线与禁用态的完整演示</p>
    </header>

    <section class="link-demo__section">
      <h2>尺寸 size</h2>
      <div class="link-demo__row">
        <Link size="sm" href="#size-sm">Small</Link>
        <Link size="md" href="#size-md">Medium</Link>
        <Link size="lg" href="#size-lg">Large</Link>
      </div>
    </section>

    <section class="link-demo__section">
      <h2>主题 theme</h2>
      <p class="link-demo__hint">
        无主题时为正常主色文字，悬停高亮为 Info；指定 theme 后与 Button 主题色一致
      </p>
      <div class="link-demo__row">
        <Link href="#theme-default">Default</Link>
        <Link theme="success" href="#theme-success">Success</Link>
        <Link theme="info" href="#theme-info">Info</Link>
        <Link theme="warn" href="#theme-warn">Warn</Link>
        <Link theme="error" href="#theme-error">Error</Link>
        <Link theme="dark" href="#theme-dark">Dark</Link>
      </div>
    </section>

    <section class="link-demo__section">
      <h2>下划线 underline</h2>
      <div class="link-demo__row">
        <Link underline="none" href="#underline-none">None</Link>
        <Link underline="hover" href="#underline-hover">Hover（默认）</Link>
        <Link underline="always" href="#underline-always">Always</Link>
        <Link theme="info" underline="always" href="#underline-info">
          Info Always
        </Link>
        <Link theme="error" underline="none" href="#underline-error">
          Error None
        </Link>
      </div>
    </section>

    <section class="link-demo__section">
      <h2>禁用 disabled</h2>
      <div class="link-demo__row">
        <Link disabled href="#disabled">Disabled</Link>
        <Link theme="success" disabled href="#disabled-success">Success</Link>
        <Link theme="info" disabled href="#disabled-info">Info</Link>
        <Link theme="warn" disabled href="#disabled-warn">Warn</Link>
        <Link theme="error" disabled href="#disabled-error">Error</Link>
      </div>
    </section>

    <section class="link-demo__section">
      <h2>段落内联</h2>
      <p class="link-demo__paragraph">
        这是一段正文，中间可插入
        <Link href="#inline">默认链接</Link>
        、
        <Link theme="info" href="#inline-info">Info 链接</Link>
        与
        <Link theme="error" underline="always" href="#inline-error">
          Error 始终下划线
        </Link>
        ，无额外 padding / margin。
      </p>
    </section>

    <section class="link-demo__section">
      <h2>外链</h2>
      <div class="link-demo__row">
        <Link href="https://viteplus.dev" target="_blank" rel="noopener noreferrer">
          Vite+ 文档
        </Link>
        <Link
          theme="info"
          underline="always"
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.link-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
}

.link-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.link-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.link-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.link-demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.link-demo__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
}

.link-demo__paragraph {
  margin: 0;
  max-width: 640px;
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
}
</style>
