import { describe, expect, test, vi, beforeEach, afterEach } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Button from "../button.vue";

describe("Button", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders default slot content", () => {
    const wrapper = mount(Button, {
      slots: { default: "提交" },
    });

    expect(wrapper.text()).toContain("提交");
    expect(wrapper.classes()).toContain("sc-btn");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).toContain("st-control");
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(Button, {
      props: { size: "lg", theme: "success" },
      slots: { default: "OK" },
    });

    expect(wrapper.classes()).toContain("st-lg");
    expect(wrapper.classes()).toContain("st-success");
  });

  test("applies plain only when theme is set", async () => {
    const wrapper = mount(Button, {
      props: { plain: true },
      slots: { default: "Plain" },
    });

    expect(wrapper.classes()).not.toContain("sc-plain-btn");

    await wrapper.setProps({ theme: "info" });
    expect(wrapper.classes()).toContain("sc-plain-btn");
    expect(wrapper.classes()).toContain("st-info");
  });

  test("applies ghost / text / link / icon / circle variants", async () => {
    const wrapper = mount(Button, {
      props: { ghost: true, circle: true },
      slots: { default: "G" },
    });

    expect(wrapper.classes()).toContain("sc-ghost-btn");
    expect(wrapper.classes()).toContain("sc-circle-btn");

    await wrapper.setProps({ variant: "text", ghost: false });
    expect(wrapper.classes()).toContain("sc-text-btn");

    await wrapper.setProps({ variant: "link" });
    expect(wrapper.classes()).toContain("sc-link-btn");

    await wrapper.setProps({ variant: "icon" });
    expect(wrapper.classes()).toContain("sc-icon-btn");
  });

  test("disabled prevents interaction and adds st-disabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: "Disabled" },
      attrs: { onClick },
    });

    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.classes()).toContain("st-disabled");

    await wrapper.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  test("loading shows indicator, disables click, without requiring disabled prop", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { loading: true, disabled: false },
      slots: { default: "Loading" },
      attrs: { onClick },
    });

    expect(wrapper.find(".sc-btn__loading").exists()).toBe(true);
    expect(wrapper.classes()).toContain("sc-btn-loading");
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.props("disabled")).toBe(false);

    await wrapper.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  test("icon variant loading does not insert sc-btn__loading", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { loading: true, variant: "icon", disabled: false },
      slots: { default: "★" },
      attrs: { onClick },
    });

    expect(wrapper.find(".sc-btn__loading").exists()).toBe(false);
    expect(wrapper.classes()).toContain("sc-btn-loading");
    expect(wrapper.classes()).toContain("sc-icon-btn");
    expect(wrapper.attributes("disabled")).toBeDefined();

    await wrapper.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  test("toggleMode toggles pressed and emits update:pressed for button/icon", async () => {
    const wrapper = mount(Button, {
      props: {
        toggleMode: true,
        pressed: false,
        variant: "button",
      },
      slots: { default: "Toggle" },
    });

    await wrapper.trigger("click");
    expect(wrapper.emitted("update:pressed")?.[0]).toEqual([true]);
    expect(wrapper.classes()).toContain("st-pressed");

    await wrapper.setProps({ pressed: true });
    await wrapper.trigger("click");
    expect(wrapper.emitted("update:pressed")?.[1]).toEqual([false]);
  });

  test("toggleMode skips resetTime and allows immediate re-toggle", async () => {
    const wrapper = mount(Button, {
      props: {
        toggleMode: true,
        pressed: false,
        resetTime: 1000,
        variant: "button",
      },
      slots: { default: "Toggle" },
    });

    await wrapper.trigger("click");
    await nextTick();
    expect(wrapper.emitted("update:pressed")?.[0]).toEqual([true]);
    expect(wrapper.vm.state.pending).toBe(false);
    expect(wrapper.attributes("disabled")).toBeUndefined();

    await wrapper.setProps({ pressed: true });
    await wrapper.trigger("click");
    await nextTick();
    expect(wrapper.emitted("update:pressed")?.[1]).toEqual([false]);
    expect(wrapper.vm.state.pending).toBe(false);
  });

  test("toggleMode does not apply for text/link variants", async () => {
    const wrapper = mount(Button, {
      props: {
        toggleMode: true,
        pressed: false,
        variant: "text",
      },
      slots: { default: "Text" },
    });

    await wrapper.trigger("click");
    expect(wrapper.emitted("update:pressed")).toBeUndefined();
    expect(wrapper.classes()).not.toContain("st-pressed");
  });

  test("resetTime enters pending cooldown via useTimer", async () => {
    const wrapper = mount(Button, {
      props: { resetTime: 1000 },
      slots: { default: "Cooldown" },
    });

    expect(wrapper.vm.state.pending).toBe(false);

    await wrapper.trigger("click");
    await nextTick();
    expect(wrapper.vm.state.pending).toBe(true);
    expect(wrapper.attributes("disabled")).toBeDefined();

    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();
    expect(wrapper.vm.state.pending).toBe(false);
  });

  test("resetTime 0 does not enter pending", async () => {
    const wrapper = mount(Button, {
      props: { resetTime: 0 },
      slots: { default: "No cooldown" },
    });

    await wrapper.trigger("click");
    await nextTick();
    expect(wrapper.vm.state.pending).toBe(false);
  });

  test("exposes state and api", () => {
    const wrapper = mount(Button, {
      slots: { default: "Expose" },
    });

    expect(wrapper.vm.state).toBeDefined();
    expect(typeof wrapper.vm.state.pending).toBe("boolean");
    expect(wrapper.vm.api).toBeDefined();
    expect(typeof wrapper.vm.api.handleClick).toBe("function");
  });
});
