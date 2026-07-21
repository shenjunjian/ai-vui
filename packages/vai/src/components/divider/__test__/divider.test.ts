import { describe, expect, test } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import Divider from "../divider.vue";

describe("Divider", () => {
  test("renders with default classes and a11y", () => {
    const wrapper = mount(Divider);

    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.classes()).toContain("v-divider");
    expect(wrapper.classes()).toContain("st-control");
    expect(wrapper.classes()).not.toContain("v-vertical-divider");
    expect(wrapper.attributes("role")).toBe("separator");
    expect(wrapper.attributes("aria-orientation")).toBe("horizontal");
  });

  test("applies vertical class and aria-orientation", () => {
    const wrapper = mount(Divider, {
      props: { vertical: true },
    });

    expect(wrapper.classes()).toContain("v-vertical-divider");
    expect(wrapper.attributes("aria-orientation")).toBe("vertical");
  });

  test("applies theme class", () => {
    const wrapper = mount(Divider, {
      props: { theme: "success" },
    });

    expect(wrapper.classes()).toContain("st-success");
    expect(wrapper.classes()).not.toContain("st-control");
  });

  test("applies borderStyle via CSS variable", () => {
    const wrapper = mount(Divider, {
      props: { borderStyle: "dashed" },
    });

    const style = wrapper.attributes("style") ?? "";
    expect(style).toContain("--divider-border-style");
    expect(style).toContain("dashed");
  });

  test("exposes state and api", () => {
    const wrapper = mount(Divider);

    expect(wrapper.vm.state).toBeDefined();
    expect(wrapper.vm.state.rootClass).toBeDefined();
    expect(wrapper.vm.state.lineStyle).toBeDefined();
    expect(wrapper.vm.api).toBeDefined();
  });
});
