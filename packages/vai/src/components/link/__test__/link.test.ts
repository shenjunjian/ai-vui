import { describe, expect, test, vi } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import Link from "../link.vue";

describe("Link", () => {
  test("renders as anchor with default classes", () => {
    const wrapper = mount(Link, {
      slots: { default: "文档" },
    });

    expect(wrapper.element.tagName).toBe("A");
    expect(wrapper.text()).toContain("文档");
    expect(wrapper.classes()).toContain("v-link");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).not.toContain("st-control");
    expect(wrapper.classes()).toContain("v-underline-hover");
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(Link, {
      props: { size: "lg", theme: "success" },
      slots: { default: "OK" },
    });

    expect(wrapper.classes()).toContain("st-lg");
    expect(wrapper.classes()).toContain("st-success");
  });

  test("applies underline modes", async () => {
    const wrapper = mount(Link, {
      props: { underline: "none" },
      slots: { default: "None" },
    });

    expect(wrapper.classes()).toContain("v-underline-none");

    await wrapper.setProps({ underline: "always" });
    expect(wrapper.classes()).toContain("v-underline-always");
    expect(wrapper.classes()).not.toContain("v-underline-none");

    await wrapper.setProps({ underline: "hover" });
    expect(wrapper.classes()).toContain("v-underline-hover");
  });

  test("disabled prevents navigation and adds st-disabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Link, {
      props: { disabled: true },
      slots: { default: "Disabled" },
      attrs: { href: "https://example.com", onClick },
    });

    expect(wrapper.classes()).toContain("st-disabled");
    expect(wrapper.attributes("aria-disabled")).toBe("true");
    expect(wrapper.attributes("tabindex")).toBe("-1");

    await wrapper.trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  test("falls through href and allows click when enabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Link, {
      slots: { default: "Go" },
      attrs: {
        href: "https://example.com",
        target: "_blank",
        onClick,
      },
    });

    expect(wrapper.attributes("href")).toBe("https://example.com");
    expect(wrapper.attributes("target")).toBe("_blank");

    await wrapper.trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("exposes state and api", () => {
    const wrapper = mount(Link, {
      slots: { default: "Expose" },
    });

    expect(wrapper.vm.state).toBeDefined();
    expect(wrapper.vm.state.rootClass).toBeDefined();
    expect(wrapper.vm.api).toBeDefined();
    expect(typeof wrapper.vm.api.handleClick).toBe("function");
  });
});
