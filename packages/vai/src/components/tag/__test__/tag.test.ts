import { describe, expect, test, vi } from "vite-plus/test";
import { flushPromises, mount } from "@vue/test-utils";
import Tag from "../tag.vue";

describe("Tag", () => {
  test("renders as span with default classes", () => {
    const wrapper = mount(Tag, {
      slots: { default: "标签" },
    });

    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.text()).toContain("标签");
    expect(wrapper.classes()).toContain("v-tag");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).toContain("st-control");
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(Tag, {
      props: { size: "sm", theme: "success" },
      slots: { default: "OK" },
    });

    expect(wrapper.classes()).toContain("st-sm");
    expect(wrapper.classes()).toContain("st-success");
    expect(wrapper.classes()).not.toContain("st-control");
  });

  test("applies plain only when theme is set", async () => {
    const wrapper = mount(Tag, {
      props: { plain: true },
      slots: { default: "Plain" },
    });

    expect(wrapper.classes()).not.toContain("v-plain-tag");

    await wrapper.setProps({ theme: "info" });
    expect(wrapper.classes()).toContain("v-plain-tag");
    expect(wrapper.classes()).toContain("st-info");
  });

  test("applies circle and disabled classes", async () => {
    const wrapper = mount(Tag, {
      props: { circle: true, disabled: true },
      slots: { default: "Pill" },
    });

    expect(wrapper.classes()).toContain("v-circle-tag");
    expect(wrapper.classes()).toContain("st-disabled");
  });

  test("closable renders close button and emits closed", async () => {
    const wrapper = mount(Tag, {
      props: { closable: true },
      slots: { default: "Closable" },
    });

    const closeBtn = wrapper.find(".v-tag__close");
    expect(closeBtn.exists()).toBe(true);

    await closeBtn.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("closed")).toHaveLength(1);
    expect(wrapper.find(".v-tag").exists()).toBe(false);
    expect(wrapper.vm.state.visible).toBe(false);
  });

  test("beforeClose returning false cancels close", async () => {
    const beforeClose = vi.fn(() => false);
    const wrapper = mount(Tag, {
      props: { closable: true, beforeClose },
      slots: { default: "Guard" },
    });

    await wrapper.find(".v-tag__close").trigger("click");
    await flushPromises();

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("closed")).toBeUndefined();
    expect(wrapper.find(".v-tag").exists()).toBe(true);
    expect(wrapper.vm.state.visible).toBe(true);
  });

  test("beforeClose returning true allows close", async () => {
    const beforeClose = vi.fn(() => true);
    const wrapper = mount(Tag, {
      props: { closable: true, beforeClose },
      slots: { default: "Allow" },
    });

    await wrapper.find(".v-tag__close").trigger("click");
    await flushPromises();

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("closed")).toHaveLength(1);
    expect(wrapper.find(".v-tag").exists()).toBe(false);
  });

  test("beforeClose promise reject cancels close", async () => {
    const beforeClose = vi.fn(() => Promise.reject(new Error("nope")));
    const wrapper = mount(Tag, {
      props: { closable: true, beforeClose },
      slots: { default: "Reject" },
    });

    await wrapper.find(".v-tag__close").trigger("click");
    await flushPromises();

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("closed")).toBeUndefined();
    expect(wrapper.find(".v-tag").exists()).toBe(true);
  });

  test("disabled closable does not close", async () => {
    const beforeClose = vi.fn(() => true);
    const wrapper = mount(Tag, {
      props: { closable: true, disabled: true, beforeClose },
      slots: { default: "Disabled" },
    });

    await wrapper.find(".v-tag__close").trigger("click");
    await flushPromises();

    expect(beforeClose).not.toHaveBeenCalled();
    expect(wrapper.emitted("closed")).toBeUndefined();
    expect(wrapper.find(".v-tag").exists()).toBe(true);
    expect(wrapper.vm.state.visible).toBe(true);
  });

  test("exposes state and api", () => {
    const wrapper = mount(Tag, {
      slots: { default: "Expose" },
    });

    expect(wrapper.vm.state).toBeDefined();
    expect(wrapper.vm.state.visible).toBe(true);
    expect(wrapper.vm.state.rootClass).toBeDefined();
    expect(wrapper.vm.api).toBeDefined();
    expect(typeof wrapper.vm.api.handleClose).toBe("function");
  });
});
