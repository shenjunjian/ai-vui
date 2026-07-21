import { describe, expect, test, vi } from "vite-plus/test";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Dialog from "../dialog.vue";

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

  test("resizable renders resize handle; drawer uses edge class", async () => {
    const dialogWrapper = mountDialog({ resizable: true });
    await flushPromises();
    expect(dialogWrapper.find(".v-modal__resize.is-corner").exists()).toBe(true);
    dialogWrapper.unmount();

    const drawerWrapper = mountDialog({
      resizable: true,
      variant: "drawer",
      placement: "right",
    });
    await flushPromises();
    expect(drawerWrapper.find(".v-modal__resize.is-edge-left").exists()).toBe(
      true,
    );
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
});
