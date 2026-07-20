import { describe, expect, test, vi } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import TextArea from "../text-area.vue";

describe("TextArea", () => {
  test("renders with default classes", () => {
    const wrapper = mount(TextArea);

    expect(wrapper.classes()).toContain("sc-textarea");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).toContain("st-control");
    expect(wrapper.find("textarea.sc-textarea__inner").exists()).toBe(true);
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(TextArea, {
      props: { size: "xs", theme: "error" },
    });

    expect(wrapper.classes()).toContain("st-xs");
    expect(wrapper.classes()).toContain("st-error");
    expect(wrapper.classes()).not.toContain("st-control");
  });

  test("disabled applies class and disables textarea", () => {
    const wrapper = mount(TextArea, {
      props: { disabled: true },
    });

    expect(wrapper.classes()).toContain("st-disabled");
    expect(wrapper.find("textarea").attributes("disabled")).toBeDefined();
  });

  test("v-model updates on input", async () => {
    const wrapper = mount(TextArea, {
      props: { modelValue: "hi" },
    });

    const textarea = wrapper.find("textarea");
    expect((textarea.element as HTMLTextAreaElement).value).toBe("hi");

    await textarea.setValue("hello\nworld");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      "hello\nworld",
    ]);
  });

  test("falls through common attrs to native textarea", () => {
    const wrapper = mount(TextArea, {
      attrs: {
        placeholder: "请输入",
        maxlength: "100",
        minlength: "2",
        rows: "4",
        cols: "40",
        name: "bio",
      },
    });

    const textarea = wrapper.find("textarea");
    expect(textarea.attributes("placeholder")).toBe("请输入");
    expect(textarea.attributes("maxlength")).toBe("100");
    expect(textarea.attributes("minlength")).toBe("2");
    expect(textarea.attributes("rows")).toBe("4");
    expect(textarea.attributes("cols")).toBe("40");
    expect(textarea.attributes("name")).toBe("bio");
  });

  test("showCount shows length and maxlength at bottom-right", async () => {
    const wrapper = mount(TextArea, {
      props: { modelValue: "abc", showCount: true },
      attrs: { maxlength: "20" },
    });

    expect(wrapper.classes()).toContain("is-show-count");
    expect(wrapper.find(".sc-textarea__count").text()).toBe("3/20");

    await wrapper.setProps({ modelValue: "abcd" });
    expect(wrapper.find(".sc-textarea__count").text()).toBe("4/20");
  });

  test("showCount without maxlength shows raw length", () => {
    const wrapper = mount(TextArea, {
      props: { modelValue: "hello", showCount: true },
    });

    expect(wrapper.find(".sc-textarea__count").text()).toBe("5");
  });

  test("exposes focus blur clear selectall", async () => {
    const wrapper = mount(TextArea, {
      props: { modelValue: "abc" },
      attachTo: document.body,
    });

    const textarea = wrapper.find("textarea").element as HTMLTextAreaElement;
    const selectSpy = vi.spyOn(textarea, "select");

    wrapper.vm.api.focus();
    expect(document.activeElement).toBe(textarea);

    wrapper.vm.api.selectall();
    expect(selectSpy).toHaveBeenCalled();

    wrapper.vm.api.blur();
    expect(document.activeElement).not.toBe(textarea);

    wrapper.vm.api.clear();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);

    wrapper.unmount();
  });

  test("clear is no-op when disabled", async () => {
    const wrapper = mount(TextArea, {
      props: { modelValue: "keep", disabled: true },
    });

    wrapper.vm.api.clear();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  test("autoSize applies is-auto-size and clamps height by rows", async () => {
    const wrapper = mount(TextArea, {
      props: {
        modelValue: "line1",
        autoSize: { minRows: 2, maxRows: 4 },
      },
      attachTo: document.body,
    });

    expect(wrapper.classes()).toContain("is-auto-size");

    const el = wrapper.find("textarea").element as HTMLTextAreaElement;
    Object.defineProperty(el, "scrollHeight", {
      configurable: true,
      get: () => 80,
    });

    wrapper.vm.api.adjustHeight();
    await nextTick();

    expect(el.style.resize).toBe("none");
    expect(el.style.height).toMatch(/px$/);
    expect(Number.parseFloat(el.style.height)).toBeGreaterThan(0);

    wrapper.unmount();
  });

  test("without autoSize height follows rows attr", () => {
    const wrapper = mount(TextArea, {
      attrs: { rows: "5" },
    });

    expect(wrapper.classes()).not.toContain("is-auto-size");
    expect(wrapper.find("textarea").attributes("rows")).toBe("5");
  });

  test("passes resize style to textarea when not autoSize", () => {
    const wrapper = mount(TextArea, {
      attrs: { style: "resize: vertical" },
    });

    const el = wrapper.find("textarea").element as HTMLTextAreaElement;
    expect(el.style.resize).toBe("vertical");
  });
});
