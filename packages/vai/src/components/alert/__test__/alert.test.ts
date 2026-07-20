import { describe, expect, test, vi } from "vite-plus/test";
import { flushPromises, mount } from "@vue/test-utils";
import Alert from "../alert.vue";

describe("Alert", () => {
  test("renders as div with default classes and role", () => {
    const wrapper = mount(Alert, {
      slots: { default: "提示内容" },
    });

    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.text()).toContain("提示内容");
    expect(wrapper.classes()).toContain("v-alert");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).toContain("st-control");
    expect(wrapper.attributes("role")).toBe("alert");
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(Alert, {
      props: { size: "sm", theme: "success" },
      slots: { default: "OK" },
    });

    expect(wrapper.classes()).toContain("st-sm");
    expect(wrapper.classes()).toContain("st-success");
    expect(wrapper.classes()).not.toContain("st-control");
  });

  test("shows default icon by theme and can hide icon", async () => {
    const wrapper = mount(Alert, {
      props: { theme: "error" },
      slots: { default: "Error" },
    });

    expect(wrapper.find(".v-alert__icon").exists()).toBe(true);
    expect(wrapper.find(".ci-close").exists()).toBe(true);

    await wrapper.setProps({ theme: "success" });
    expect(wrapper.find(".ci-check").exists()).toBe(true);

    await wrapper.setProps({ theme: "warn" });
    expect(wrapper.find(".ci-risk").exists()).toBe(true);

    await wrapper.setProps({ showIcon: false });
    expect(wrapper.find(".v-alert__icon").exists()).toBe(false);
  });

  test("icon slot overrides default icon", () => {
    const wrapper = mount(Alert, {
      props: { theme: "info" },
      slots: {
        default: "Custom",
        icon: '<span class="custom-icon">★</span>',
      },
    });

    expect(wrapper.find(".custom-icon").exists()).toBe(true);
    expect(wrapper.find(".ci-info").exists()).toBe(false);
  });

  test("closable renders close button and emits closed", async () => {
    const wrapper = mount(Alert, {
      props: { closable: true },
      slots: { default: "Closable" },
    });

    const closeBtn = wrapper.find(".v-alert__close");
    expect(closeBtn.exists()).toBe(true);
    expect(closeBtn.attributes("aria-label")).toBe("关闭");

    await closeBtn.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("closed")).toHaveLength(1);
    expect(wrapper.find(".v-alert").exists()).toBe(false);
    expect(wrapper.vm.state.visible).toBe(false);
  });

  test("close slot overrides default close content", () => {
    const wrapper = mount(Alert, {
      props: { closable: true },
      slots: {
        default: "Close slot",
        close: '<span class="custom-close">关</span>',
      },
    });

    expect(wrapper.find(".custom-close").text()).toBe("关");
  });

  test("beforeClose returning false cancels close", async () => {
    const beforeClose = vi.fn(() => false);
    const wrapper = mount(Alert, {
      props: { closable: true, beforeClose },
      slots: { default: "Guard" },
    });

    await wrapper.find(".v-alert__close").trigger("click");
    await flushPromises();

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("closed")).toBeUndefined();
    expect(wrapper.find(".v-alert").exists()).toBe(true);
    expect(wrapper.vm.state.visible).toBe(true);
  });

  test("beforeClose returning true allows close", async () => {
    const beforeClose = vi.fn(() => true);
    const wrapper = mount(Alert, {
      props: { closable: true, beforeClose },
      slots: { default: "Allow" },
    });

    await wrapper.find(".v-alert__close").trigger("click");
    await flushPromises();

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("closed")).toHaveLength(1);
    expect(wrapper.find(".v-alert").exists()).toBe(false);
  });

  test("beforeClose promise reject cancels close", async () => {
    const beforeClose = vi.fn(() => Promise.reject(new Error("nope")));
    const wrapper = mount(Alert, {
      props: { closable: true, beforeClose },
      slots: { default: "Reject" },
    });

    await wrapper.find(".v-alert__close").trigger("click");
    await flushPromises();

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("closed")).toBeUndefined();
    expect(wrapper.find(".v-alert").exists()).toBe(true);
  });

  test("exposes state and api", () => {
    const wrapper = mount(Alert, {
      slots: { default: "Expose" },
    });

    expect(wrapper.vm.state).toBeDefined();
    expect(wrapper.vm.state.visible).toBe(true);
    expect(wrapper.vm.state.rootClass).toBeDefined();
    expect(wrapper.vm.state.iconClass).toBe("ci-info");
    expect(wrapper.vm.api).toBeDefined();
    expect(typeof wrapper.vm.api.handleClose).toBe("function");
  });
});
