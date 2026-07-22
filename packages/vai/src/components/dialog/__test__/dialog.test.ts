import { describe, expect, test, vi, afterEach } from "vite-plus/test";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Dialog from "../dialog.vue";
import { resetScrollLockForTest } from "../../../hooks/useScrollLock.ts";

afterEach(() => {
  resetScrollLockForTest();
});

function mountDialog(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return mount(Dialog, {
    props: { open: true, ...props },
    slots: { default: "正文内容", ...slots },
    attachTo: document.body,
  });
}

describe("Dialog", () => {
  test("renders dialog with default structure and classes", async () => {
    const wrapper = mountDialog({ title: "标题" });
    await flushPromises();

    const dialog = wrapper.find("dialog");
    expect(dialog.exists()).toBe(true);
    expect(dialog.classes()).toContain("v-modal");
    expect(wrapper.find(".v-modal__title").text()).toBe("标题");
    expect(wrapper.find(".v-modal__body").text()).toContain("正文内容");
    expect(wrapper.find(".v-modal__footer").exists()).toBe(true);
    expect(wrapper.find(".v-modal__close").exists()).toBe(true);
    expect(dialog.attributes("closedby")).toBe("any");
  });

  test("applies drawer variant and placement classes", async () => {
    const wrapper = mountDialog({
      variant: "drawer",
      placement: "left",
    });
    await flushPromises();

    expect(wrapper.classes()).toContain("v-drawer-modal");
    expect(wrapper.classes()).toContain("is-left");
  });

  test("hides header / footer / close by props", async () => {
    const wrapper = mountDialog({
      showHeader: false,
      showFooter: false,
      showClose: false,
    });
    await flushPromises();

    expect(wrapper.find(".v-modal__header").exists()).toBe(false);
    expect(wrapper.find(".v-modal__footer").exists()).toBe(false);
    expect(wrapper.find(".v-modal__close").exists()).toBe(false);
  });

  test("title and footer slots override defaults", async () => {
    const wrapper = mountDialog(
      { title: "Prop Title" },
      {
        title: '<span class="custom-title">Slot Title</span>',
        footer: '<button class="custom-footer" type="button">自定义</button>',
      },
    );
    await flushPromises();

    expect(wrapper.find(".custom-title").text()).toBe("Slot Title");
    expect(wrapper.find(".custom-footer").text()).toBe("自定义");
    expect(wrapper.text()).not.toContain("取消");
  });

  test("mask classes reflect showMask and maskStyle", async () => {
    const wrapper = mountDialog({
      showMask: false,
      maskStyle: "blur",
    });
    await flushPromises();

    expect(wrapper.classes()).toContain("is-no-mask");
    expect(wrapper.classes()).not.toContain("is-mask-blur");

    await wrapper.setProps({ showMask: true, maskStyle: "blur" });
    expect(wrapper.classes()).toContain("is-mask-blur");
    expect(wrapper.classes()).not.toContain("is-no-mask");
  });

  test("v-model:open opens and closes dialog", async () => {
    const wrapper = mount(Dialog, {
      props: { open: false, title: "开关" },
      slots: { default: "内容" },
      attachTo: document.body,
    });
    await flushPromises();

    const el = wrapper.element as HTMLDialogElement;
    expect(el.open).toBe(false);

    await wrapper.setProps({ open: true });
    await flushPromises();
    await nextTick();
    expect(el.open).toBe(true);
    expect(wrapper.emitted("opened")?.length).toBeGreaterThanOrEqual(1);

    await wrapper.setProps({ open: false });
    await flushPromises();
    expect(el.open).toBe(false);
    expect(wrapper.emitted("closed")?.length).toBeGreaterThanOrEqual(1);
  });

  test("api.open / api.close work", async () => {
    const wrapper = mount(Dialog, {
      props: { open: false },
      slots: { default: "API" },
      attachTo: document.body,
    });
    await flushPromises();

    wrapper.vm.api.open();
    await flushPromises();
    await nextTick();
    expect((wrapper.element as HTMLDialogElement).open).toBe(true);
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([true]);

    wrapper.vm.api.close();
    await flushPromises();
    expect((wrapper.element as HTMLDialogElement).open).toBe(false);
    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
  });

  test("close button calls requestClose and emits closed", async () => {
    const wrapper = mountDialog({ title: "关闭" });
    await flushPromises();
    await nextTick();

    await wrapper.find(".v-modal__close").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("closed")?.length).toBeGreaterThanOrEqual(1);
    expect((wrapper.element as HTMLDialogElement).open).toBe(false);
  });

  test("beforeClose returning false cancels close", async () => {
    const beforeClose = vi.fn(() => false);
    const wrapper = mountDialog({ beforeClose });
    await flushPromises();
    await nextTick();

    await wrapper.find(".v-modal__close").trigger("click");
    await flushPromises();

    expect(beforeClose).toHaveBeenCalled();
    expect((wrapper.element as HTMLDialogElement).open).toBe(true);
    expect(wrapper.emitted("closed")).toBeUndefined();
  });

  test("beforeClose returning true allows close", async () => {
    const beforeClose = vi.fn(() => true);
    const wrapper = mountDialog({ beforeClose });
    await flushPromises();
    await nextTick();

    await wrapper.find(".v-modal__close").trigger("click");
    await flushPromises();

    expect(beforeClose).toHaveBeenCalled();
    expect((wrapper.element as HTMLDialogElement).open).toBe(false);
    expect(wrapper.emitted("closed")?.length).toBeGreaterThanOrEqual(1);
  });

  test("destroyOnClose removes entire dialog when closed", async () => {
    const wrapper = mountDialog({ destroyOnClose: true, title: "销毁" });
    await flushPromises();
    await nextTick();

    expect(wrapper.find("dialog").exists()).toBe(true);

    wrapper.vm.api.close();
    await flushPromises();

    expect(wrapper.find("dialog").exists()).toBe(false);
    expect(wrapper.vm.state.dialogMounted).toBe(false);
  });

  test("keeps dialog mounted with display none when destroyOnClose is false", async () => {
    const wrapper = mountDialog({ title: "常驻" });
    await flushPromises();
    await nextTick();

    wrapper.vm.api.close();
    await flushPromises();

    const dialog = wrapper.find("dialog");
    expect(dialog.exists()).toBe(true);
    expect((dialog.element as HTMLDialogElement).open).toBe(false);
    expect(wrapper.vm.state.dialogMounted).toBe(true);
  });

  test("preserves drag/resize position when destroyOnClose is false", async () => {
    const wrapper = mountDialog({ draggable: true, title: "保留位置" });
    await flushPromises();
    await nextTick();

    const dialog = wrapper.find("dialog").element as HTMLDialogElement;
    dialog.style.marginLeft = "120px";
    dialog.style.marginTop = "80px";
    dialog.style.width = "420px";
    dialog.style.height = "300px";

    wrapper.vm.api.close();
    await flushPromises();

    expect(dialog.style.marginLeft).toBe("120px");
    expect(dialog.style.marginTop).toBe("80px");
    expect(dialog.style.width).toBe("420px");
    expect(dialog.style.height).toBe("300px");
  });

  test("resizable: dialog uses CSS resize class; drawer renders edge handle", async () => {
    const dialogWrapper = mountDialog({ resizable: true });
    await flushPromises();
    expect(dialogWrapper.find("dialog").classes()).toContain("is-resizable");
    expect(dialogWrapper.find(".v-modal__resize").exists()).toBe(false);
    dialogWrapper.unmount();

    const drawerWrapper = mountDialog({
      resizable: true,
      variant: "drawer",
      placement: "right",
    });
    await flushPromises();
    expect(drawerWrapper.find("dialog").classes()).not.toContain("is-resizable");
    expect(drawerWrapper.find(".v-modal__resize.is-edge-left").exists()).toBe(
      true,
    );
  });

  test("drawer resizable writes panel style width/height during drag", async () => {
    const wrapper = mountDialog({
      resizable: true,
      variant: "drawer",
      placement: "right",
    });
    await flushPromises();
    await nextTick();

    const panel = wrapper.find(".v-modal__panel").element as HTMLElement;
    const handle = wrapper.find(".v-modal__resize").element;

    panel.getBoundingClientRect = () =>
      ({
        x: 800,
        y: 0,
        width: 400,
        height: 600,
        top: 0,
        left: 800,
        right: 1200,
        bottom: 600,
        toJSON() {
          return {};
        },
      }) as DOMRect;

    const captured = new Set<number>();
    handle.setPointerCapture = (id: number) => {
      captured.add(id);
    };
    handle.releasePointerCapture = (id: number) => {
      captured.delete(id);
    };
    handle.hasPointerCapture = (id: number) => captured.has(id);

    handle.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        button: 0,
        clientX: 800,
        clientY: 300,
      }),
    );
    await nextTick();
    expect(wrapper.find("dialog").classes()).toContain("is-resizing");

    document.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        clientX: 750,
        clientY: 300,
      }),
    );
    expect(panel.style.width).toBe("450px");

    document.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        clientX: 750,
        clientY: 300,
      }),
    );
    await nextTick();
    expect(wrapper.find("dialog").classes()).not.toContain("is-resizing");
    expect(panel.style.width).toBe("450px");
  });

  test("opens locks document scroll; closes unlocks immediately", async () => {
    const html = document.documentElement;
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: html.clientWidth + 16,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 200,
    });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    const wrapper = mount(Dialog, {
      props: { open: false, title: "滚动锁" },
      slots: { default: "内容" },
      attachTo: document.body,
    });
    await flushPromises();

    expect(html.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");

    await wrapper.setProps({ open: true });
    await flushPromises();
    await nextTick();
    expect(html.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-200px");
    expect(document.body.style.paddingRight).toBe("16px");

    await wrapper.setProps({ open: false });
    await flushPromises();
    expect(html.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
    expect(document.body.style.paddingRight).toBe("");
    expect(scrollTo).toHaveBeenCalledWith(0, 200);

    wrapper.unmount();
    scrollTo.mockRestore();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
    });
  });

  test("exposes state and api", async () => {
    const wrapper = mountDialog();
    await flushPromises();

    expect(wrapper.vm.state).toBeDefined();
    expect(wrapper.vm.state.rootClass).toBeDefined();
    expect(typeof wrapper.vm.api.open).toBe("function");
    expect(typeof wrapper.vm.api.close).toBe("function");
    expect(typeof wrapper.vm.api.requestClose).toBe("function");
  });

  test("draggable writes margin-left/top and clamps to viewport", async () => {
    const wrapper = mountDialog({ draggable: true, title: "可拖" });
    await flushPromises();
    await nextTick();

    const dialog = wrapper.find("dialog").element as HTMLDialogElement;
    const header = wrapper.find(".v-modal__header").element;

    document.documentElement.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        width: 1000,
        height: 800,
        top: 0,
        left: 0,
        right: 1000,
        bottom: 800,
        toJSON() {
          return {};
        },
      }) as DOMRect;

    dialog.getBoundingClientRect = () =>
      ({
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        top: 100,
        left: 100,
        right: 300,
        bottom: 250,
        toJSON() {
          return {};
        },
      }) as DOMRect;

    const captured = new Set<number>();
    header.setPointerCapture = (id: number) => {
      captured.add(id);
    };
    header.releasePointerCapture = (id: number) => {
      captured.delete(id);
    };
    header.hasPointerCapture = (id: number) => captured.has(id);

    header.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        button: 0,
        clientX: 150,
        clientY: 120,
      }),
    );
    expect(wrapper.emitted("drag-start")?.length).toBe(1);
    await nextTick();
    expect(wrapper.find("dialog").classes()).toContain("is-dragging");
    // 开始时固化当前屏幕位置为 margin
    expect(dialog.style.marginLeft).toBe("100px");
    expect(dialog.style.marginTop).toBe("100px");
    // 拖动中关掉 light dismiss，避免 pointerup 落在盒外时被 closedby=any 关掉
    expect(dialog.getAttribute("closedby")).toBe("closerequest");

    document.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        clientX: 150 + 10_000,
        clientY: 120 + 10_000,
      }),
    );
    expect(wrapper.emitted("drag-move")?.length).toBeGreaterThanOrEqual(1);

    // 超大位移被钳制：右/下边不超过视口 1000×800 → left=800, top=650
    expect(dialog.style.marginLeft).toBe("800px"); // 1000 - 200
    expect(dialog.style.marginTop).toBe("650px"); // 800 - 150

    document.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
      }),
    );
    await nextTick();
    expect(wrapper.emitted("drag-end")?.length).toBe(1);
    expect(wrapper.find("dialog").classes()).not.toContain("is-dragging");
    // 结束后仍保留 inline margin，无需同步到 state
    expect(dialog.style.marginLeft).toBe("800px");
    expect(dialog.style.marginTop).toBe("650px");
    expect(dialog.getAttribute("closedby")).toBe("any");
  });

  test("draggable ignores pointerdown on interactive header controls", async () => {
    const wrapper = mountDialog({ draggable: true, title: "标题" });
    await flushPromises();
    await nextTick();

    await wrapper.find(".v-modal__close").trigger("pointerdown");
    expect(wrapper.emitted("drag-start")).toBeUndefined();
    expect(wrapper.find("dialog").classes()).not.toContain("is-dragging");
  });
});
