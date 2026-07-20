<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { usePopper, type PopperPlacement } from "vai";

const placements: PopperPlacement[] = [
  "top",
  "top-start",
  "top-end",
  "right",
  "right-start",
  "right-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
];

const referenceEl = ref<HTMLElement | null>(null);
const popperEl = ref<HTMLElement | null>(null);

const placement = ref<PopperPlacement>("bottom");
const crossOffset = ref(0);
const awayOffset = ref(0);
const arrowVisible = ref(true);
const arrowSize = ref(8);
const arrowSafeOffset = ref(8);
const animate = ref(true);
const autoHide = ref(false);
const customClass = ref("");

const popper = usePopper({
  reference: null,
  popper: null,
  show: false,
  placement: placement.value,
  offset: [crossOffset.value, awayOffset.value],
  arrowVisible: arrowVisible.value,
  arrowSize: arrowSize.value,
  arrowSafeOffset: arrowSafeOffset.value,
  animate: animate.value,
  autoHide: autoHide.value,
  customClass: customClass.value,
});

/** 滚动区独立实例：验证锚定跟随与 autoHide */
const scrollRefEl = ref<HTMLElement | null>(null);
const scrollPopperEl = ref<HTMLElement | null>(null);
const scrollAutoHide = ref(true);
const scrollBox = ref<HTMLElement | null>(null);

const scrollPopper = usePopper({
  reference: null,
  popper: null,
  show: false,
  placement: "right",
  arrowVisible: true,
  animate: true,
  autoHide: true,
});

onMounted(() => {
  popper.reference = referenceEl.value;
  popper.popper = popperEl.value;
  scrollPopper.reference = scrollRefEl.value;
  scrollPopper.popper = scrollPopperEl.value;
  // 初始滚到中间，让触发按钮落在可视区
  if (scrollBox.value) {
    scrollBox.value.scrollTop =
      (scrollBox.value.scrollHeight - scrollBox.value.clientHeight) / 2;
  }
});

watch(referenceEl, (el) => {
  popper.reference = el;
});
watch(popperEl, (el) => {
  popper.popper = el;
});
watch(scrollRefEl, (el) => {
  scrollPopper.reference = el;
});
watch(scrollPopperEl, (el) => {
  scrollPopper.popper = el;
});

watch(placement, (v) => {
  popper.placement = v;
});
watch([crossOffset, awayOffset], ([cross, away]) => {
  popper.offset = [cross, away];
});
watch(arrowVisible, (v) => {
  popper.arrowVisible = v;
});
watch(arrowSize, (v) => {
  popper.arrowSize = v;
});
watch(arrowSafeOffset, (v) => {
  popper.arrowSafeOffset = v;
});
watch(animate, (v) => {
  popper.animate = v;
});
watch(autoHide, (v) => {
  popper.autoHide = v;
});
watch(customClass, (v) => {
  popper.customClass = v;
});
watch(scrollAutoHide, (v) => {
  scrollPopper.autoHide = v;
});

function toggle() {
  popper.show = !popper.show;
}

function openAt(next: PopperPlacement) {
  placement.value = next;
  popper.show = true;
}

function toggleScrollPopper() {
  scrollPopper.show = !scrollPopper.show;
}
</script>

<template>
  <div class="popper-demo">
    <header class="popper-demo__header">
      <h1>usePopper</h1>
      <p>
        基于 Popover API + CSS Anchor Positioning 的弹出层 hook，覆盖
        placement / offset / arrow / animate / autoHide
      </p>
    </header>

    <section class="popper-demo__section">
      <h2>交互演示</h2>
      <p class="popper-demo__hint">
        点击目标按钮开关弹出层；修改下方选项可实时生效。
      </p>

      <div class="popper-demo__stage">
        <div class="popper-demo__stage-inner">
          <button ref="referenceEl" type="button" class="popper-demo__trigger" @click="toggle">
            {{ popper.show ? "关闭" : "打开" }} Popover
          </button>
        </div>
      </div>

      <div ref="popperEl" class="popper-demo__panel" role="tooltip">
        <strong>Popper</strong>
        <span>placement: {{ placement }}</span>
      </div>

      <div class="popper-demo__controls">
        <label class="popper-demo__field">
          <span>placement</span>
          <select v-model="placement">
            <option v-for="p in placements" :key="p" :value="p">{{ p }}</option>
          </select>
        </label>

        <label class="popper-demo__field">
          <span>offset 交叉轴</span>
          <input v-model.number="crossOffset" type="number" step="2" />
        </label>

        <label class="popper-demo__field">
          <span>offset 远离轴</span>
          <input v-model.number="awayOffset" type="number" step="2" />
        </label>

        <label class="popper-demo__field">
          <span>arrowSize</span>
          <input v-model.number="arrowSize" type="number" min="0" step="1" />
        </label>

        <label class="popper-demo__field">
          <span>arrowSafeOffset</span>
          <input v-model.number="arrowSafeOffset" type="number" min="0" step="1" />
        </label>

        <label class="popper-demo__check">
          <input v-model="arrowVisible" type="checkbox" />
          arrowVisible
        </label>

        <label class="popper-demo__check">
          <input v-model="animate" type="checkbox" />
          animate
        </label>

        <label class="popper-demo__check">
          <input v-model="autoHide" type="checkbox" />
          autoHide
        </label>

        <label class="popper-demo__check">
          <input type="checkbox" :checked="!!customClass" @change="
            customClass = ($event.target as HTMLInputElement).checked
              ? 'popper-demo__panel--accent'
              : ''
            " />
          customClass
        </label>
      </div>
    </section>

    <section class="popper-demo__section">
      <h2>12 方位快捷切换</h2>
      <p class="popper-demo__hint">点击任一 placement，立即以该方位打开弹出层</p>
      <div class="popper-demo__placements">
        <button v-for="p in placements" :key="p" type="button" class="popper-demo__chip"
          :class="{ 'is-active': placement === p && popper.show }" @click="openAt(p)">
          {{ p }}
        </button>
      </div>
    </section>

    <section class="popper-demo__section">
      <h2>滚动区弹出层（锚定 + autoHide）</h2>
      <p class="popper-demo__hint">
        1. 点击滚动区内的按钮打开弹出层<br />
        2. 在框内上下滚动：关闭 autoHide 时弹出层应跟随按钮；开启后任意滚动即关闭
      </p>

      <label class="popper-demo__check popper-demo__check--inline">
        <input v-model="scrollAutoHide" type="checkbox" />
        本示例 autoHide（当前 {{ scrollAutoHide ? "开" : "关" }}）
      </label>

      <div ref="scrollBox" class="popper-demo__scroll">
        <div class="popper-demo__scroll-spacer">↑ 向上滚动</div>
        <div class="popper-demo__scroll-center">
          <button ref="scrollRefEl" type="button" class="popper-demo__trigger" @click="toggleScrollPopper">
            {{ scrollPopper.show ? "关闭" : "打开" }} 滚动区 Popover
          </button>
        </div>
        <div class="popper-demo__scroll-spacer">↓ 向下滚动</div>
      </div>

      <div ref="scrollPopperEl" class="popper-demo__panel" role="tooltip">
        <strong>Scroll Popper</strong>
        <span>在框内滚动验证锚定 / autoHide</span>
        <span>在框内滚动验证锚定 / autoHide</span>
        <span>在框内滚动验证锚定 / autoHide</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.popper-demo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 24px 64px;
  text-align: left;
  max-width: 720px;
}

.popper-demo__header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.popper-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.popper-demo__section h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.popper-demo__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.popper-demo__stage {
  display: grid;
  place-items: center;
  min-height: 220px;
  padding: 24px;
  background:
    radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0) 0 0 / 16px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.popper-demo__trigger {
  appearance: none;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.popper-demo__trigger:hover {
  background: #1d4ed8;
}

.popper-demo__panel {
  min-width: 160px;
  padding: 12px 14px;
  /* 勿在关闭态写死 display，否则会盖住 Popover UA 的 display:none */
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #1f2937;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
}
.popper-demo__panel:popover-open {
  display: flex;
}

.popper-demo__panel strong {
  font-size: 14px;
}

.popper-demo__panel--accent {
  color: #fff;
  background: #0f766e;
  border-color: #0f766e;
}

.popper-demo__controls {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.popper-demo__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.popper-demo__field select,
.popper-demo__field input[type="number"] {
  height: 34px;
  padding: 0 8px;
  font-size: 13px;
  color: #111827;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.popper-demo__check {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: end;
  min-height: 34px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.popper-demo__check--inline {
  align-self: start;
  margin-bottom: 12px;
}

.popper-demo__placements {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.popper-demo__chip {
  appearance: none;
  padding: 6px 10px;
  font-size: 12px;
  font-family: ui-monospace, Consolas, monospace;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
}

.popper-demo__chip.is-active {
  color: #1d4ed8;
  background: #eff6ff;
  border-color: #93c5fd;
}

.popper-demo__scroll {
  max-height: 200px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.popper-demo__scroll-spacer {
  height: 200px;
  display: grid;
  place-items: center;
  color: #9ca3af;
  font-size: 13px;
}

.popper-demo__scroll-center {
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background: #fff;
  border-block: 1px dashed #e5e7eb;
}
</style>
