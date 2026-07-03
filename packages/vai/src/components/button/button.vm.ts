import { reactive, onMounted, onUnmounted } from "vue";
import type { ButtonCtx } from "./button.vue";

/** TODO 规范
 * 1、禁止将props的属性转存到state上。 一定要使用 computed
 * 2、减少watch使用。 禁止 props.xxx && watch(...) 用法。
 * 3、禁止computed中有set函数。
 * 4、禁止dom操作，禁止js式的事件绑定（避免原来的on,off方法，事件应写到模板上），禁止添加移除class
 *    但是对于临时状态，不影响主逻辑变化时， 建议直接操作dom, 比如： hover, button的reset等。
 *
 * 5、事件优先考虑冒泡到最上层处理，尤其是在有列表循环时
 * 6、在 useContext 中少使用instance, 禁止用 slots， 和 slots.default() 生成vnode的逻辑
 * 7、避免state下有值
 * 8、当遇到 window.resize,  document.click/dragstart  等事件绑定时， 使用useXXX 等hooks处理
 */

export default function useVm(ctx: ButtonCtx) {
  const { props, slots, refs, models } = ctx;

  const state = reactive({});

  const api = {};

  onMounted(() => {});
  onUnmounted(() => {});
  return { state, api };
}
