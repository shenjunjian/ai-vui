import { describe, expect, test } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Tag from "../tag.vue";

describe("Tag", () => {
  test("renders as span with default classes", () => {
    const wrapper = mount(Tag, {
      slots: { default: "标签" },
    });

    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.text()).toContain("标签");
    expect(wrapper.classes()).toContain("sc-tag");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).not.toContain("st-control");
    expect(wrapper.classes()).not.toContain("st-info");
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(Tag, {
      props: { size: "xs", theme: "success" },
      slots: { default: "OK" },
    });

    expect(wrapper.classes()).toContain("st-xs");
    expect(wrapper.classes()).toContain("st-success");
  });

  test("applies plain only when theme is set", async () => {
    const wrapper = mount(Tag, {
      props: { plain: true },
      slots: { default: "Plain" },
    });

    expect(wrapper.classes()).not.toContain("sc-plain-tag");

    await wrapper.setProps({ theme: "info" });
    expect(wrapper.classes()).toContain("sc-plain-tag");
    expect(wrapper.classes()).toContain("st-info");
  });

  test("applies circle and disabled classes", async () => {
    const wrapper = mount(Tag, {
      props: { circle: true, disabled: true },
      slots: { default: "Pill" },
    });

    expect(wrapper.classes()).toContain("sc-circle-tag");
    expect(wrapper.classes()).toContain("st-disabled");
  });

  test("closable renders close button and emits closing/closed", async () => {
    const wrapper = mount(Tag, {
      props: { closable: true },
      slots: { default: "Closable" },
    });

    const closeBtn = wrapper.find(".sc-tag__close");
    expect(closeBtn.exists()).toBe(true);

    await closeBtn.trigger("click");
    await nextTick();

    expect(wrapper.emitted("closing")).toHaveLength(1);
    expect(wrapper.emitted("closed")).toHaveLength(1);
    expect(wrapper.find(".sc-tag").exists()).toBe(false);
    expect(wrapper.vm.state.visible).toBe(false);
  });

  test("disabled closable does not close", async () => {
    const wrapper = mount(Tag, {
      props: { closable: true, disabled: true },
      slots: { default: "Disabled" },
    });

    await wrapper.find(".sc-tag__close").trigger("click");
    await nextTick();

    expect(wrapper.emitted("closing")).toBeUndefined();
    expect(wrapper.emitted("closed")).toBeUndefined();
    expect(wrapper.find(".sc-tag").exists()).toBe(true);
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
