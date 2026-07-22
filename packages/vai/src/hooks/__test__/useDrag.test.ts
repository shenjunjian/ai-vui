import { describe, expect, test, vi, beforeEach, afterEach } from "vite-plus/test";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { useDrag, type DragOptionInput } from "../useDrag.ts";

function mountUseDrag(option: DragOptionInput = {}) {
  let api!: ReturnType<typeof useDrag>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useDrag(option);
        return () => h("div");
      },
    }),
  );
  return { api, wrapper };
}

function dispatchPointer(
  target: EventTarget,
  type: string,
  init: Partial<PointerEvent> & { clientX?: number; clientY?: number; pointerId?: number; button?: number },
) {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: init.pointerId ?? 1,
    button: init.button ?? 0,
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

describe("useDrag", () => {
  let el: HTMLElement;
  let handler: HTMLElement;
  let wrappers: VueWrapper[] = [];

  beforeEach(() => {
    el = document.createElement("div");
    handler = document.createElement("div");
    document.body.append(el, handler);
    el.getBoundingClientRect = () =>
      ({
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        top: 20,
        left: 10,
        right: 110,
        bottom: 100,
        toJSON() {
          return {};
        },
      }) as DOMRect;
    handlersCapture(handler);
  });

  afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    wrappers = [];
    el.remove();
    handler.remove();
    vi.restoreAllMocks();
  });

  function handlersCapture(node: HTMLElement) {
    const captured = new Set<number>();
    node.setPointerCapture = (id: number) => {
      captured.add(id);
    };
    node.releasePointerCapture = (id: number) => {
      captured.delete(id);
    };
    node.hasPointerCapture = (id: number) => captured.has(id);
  }

  test("多实例拥有独立的 _ 状态", async () => {
    const a = mountUseDrag({ el, handler });
    const b = mountUseDrag({ el, handler });
    wrappers.push(a.wrapper, b.wrapper);
    await nextTick();

    a.api.state._.deltaX = 42;
    expect(b.api.state._.deltaX).toBe(0);
    expect(a.api.state._).not.toBe(b.api.state._);
  });

  test("挂载后自动 init，并走完 start / apply / end", async () => {
    const startDrag = vi.fn();
    const applyDrag = vi.fn();
    const endDrag = vi.fn();
    const { api, wrapper } = mountUseDrag({
      el,
      handler,
      startDrag,
      applyDrag,
      endDrag,
    });
    wrappers.push(wrapper);
    await nextTick();

    dispatchPointer(handler, "pointerdown", { clientX: 50, clientY: 60 });
    expect(api.state._.isDragging).toBe(true);
    expect(startDrag).toHaveBeenCalledTimes(1);
    expect(el.classList.contains("st-dragging")).toBe(true);

    dispatchPointer(document, "pointermove", { clientX: 80, clientY: 100 });
    expect(api.state._.deltaX).toBe(30);
    expect(api.state._.deltaY).toBe(40);
    expect(applyDrag).toHaveBeenCalled();

    dispatchPointer(document, "pointerup", { clientX: 80, clientY: 100 });
    expect(api.state._.isDragging).toBe(false);
    expect(el.classList.contains("st-dragging")).toBe(false);
    expect(endDrag).toHaveBeenCalledTimes(1);
  });

  test("handler 缺省时使用 el", async () => {
    const applyDrag = vi.fn();
    const { wrapper } = mountUseDrag({ el, applyDrag });
    wrappers.push(wrapper);
    await nextTick();

    dispatchPointer(el, "pointerdown", { clientX: 0, clientY: 0 });
    dispatchPointer(document, "pointermove", { clientX: 5, clientY: 5 });
    expect(applyDrag).toHaveBeenCalled();
  });

  test("disabled 为 true 时不会 init；改为 false 后可 init", async () => {
    const disabled = ref(true);
    const { api, wrapper } = mountUseDrag({ el, handler, disabled });
    wrappers.push(wrapper);
    await nextTick();

    dispatchPointer(handler, "pointerdown", { clientX: 0, clientY: 0 });
    expect(api.state._.isDragging).toBe(false);

    disabled.value = false;
    await nextTick();
    dispatchPointer(handler, "pointerdown", { clientX: 0, clientY: 0 });
    expect(api.state._.isDragging).toBe(true);
  });

  test("disabled 开启时会完整收尾", async () => {
    const disabled = ref(false);
    const endDrag = vi.fn();
    const { api, wrapper } = mountUseDrag({ el, handler, disabled, endDrag });
    wrappers.push(wrapper);
    await nextTick();

    dispatchPointer(handler, "pointerdown", { clientX: 0, clientY: 0 });
    expect(api.state._.isDragging).toBe(true);

    disabled.value = true;
    await nextTick();
    expect(api.state._.isDragging).toBe(false);
    expect(el.classList.contains("st-dragging")).toBe(false);
    expect(endDrag).toHaveBeenCalledTimes(1);
  });

  test("元素晚就绪时需主动 init", async () => {
    const box = ref<HTMLElement | null>(null);
    const applyDrag = vi.fn();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { api, wrapper } = mountUseDrag({ el: box, applyDrag });
    wrappers.push(wrapper);
    await nextTick();
    expect(warn).toHaveBeenCalled();

    box.value = el;
    handlersCapture(el);
    api.init();

    dispatchPointer(el, "pointerdown", { clientX: 1, clientY: 1 });
    dispatchPointer(document, "pointermove", { clientX: 4, clientY: 5 });
    expect(applyDrag).toHaveBeenCalled();
  });

  test("忽略非当前 pointerId 的 move", async () => {
    const applyDrag = vi.fn();
    const { wrapper } = mountUseDrag({ el, handler, applyDrag });
    wrappers.push(wrapper);
    await nextTick();

    dispatchPointer(handler, "pointerdown", { pointerId: 1, clientX: 0, clientY: 0 });
    dispatchPointer(document, "pointermove", { pointerId: 2, clientX: 100, clientY: 100 });
    expect(applyDrag).not.toHaveBeenCalled();

    dispatchPointer(document, "pointermove", { pointerId: 1, clientX: 10, clientY: 10 });
    expect(applyDrag).toHaveBeenCalledTimes(1);
  });

  test("pointercancel 会结束拖拽", async () => {
    const endDrag = vi.fn();
    const { api, wrapper } = mountUseDrag({ el, handler, endDrag });
    wrappers.push(wrapper);
    await nextTick();

    dispatchPointer(handler, "pointerdown", { clientX: 0, clientY: 0 });
    dispatchPointer(document, "pointercancel", { clientX: 0, clientY: 0 });
    expect(api.state._.isDragging).toBe(false);
    expect(endDrag).toHaveBeenCalledTimes(1);
  });

  test("shouldStart 返回 false 时不进入拖拽", async () => {
    const startDrag = vi.fn();
    const applyDrag = vi.fn();
    const { api, wrapper } = mountUseDrag({
      el,
      handler,
      shouldStart: () => false,
      startDrag,
      applyDrag,
    });
    wrappers.push(wrapper);
    await nextTick();

    dispatchPointer(handler, "pointerdown", { clientX: 0, clientY: 0 });
    expect(api.state._.isDragging).toBe(false);
    expect(startDrag).not.toHaveBeenCalled();
    dispatchPointer(document, "pointermove", { clientX: 10, clientY: 10 });
    expect(applyDrag).not.toHaveBeenCalled();
  });

  test("卸载时自动 stop", async () => {
    const endDrag = vi.fn();
    const { api, wrapper } = mountUseDrag({ el, handler, endDrag });
    wrappers.push(wrapper);
    await nextTick();

    dispatchPointer(handler, "pointerdown", { clientX: 0, clientY: 0 });
    wrapper.unmount();
    wrappers = [];
    expect(api.state._.isDragging).toBe(false);
    expect(endDrag).toHaveBeenCalled();
  });
});
