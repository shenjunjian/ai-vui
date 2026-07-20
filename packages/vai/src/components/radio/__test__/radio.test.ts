import { describe, expect, test } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Radio from "../radio.vue";

describe("Radio", () => {
  test("renders with default classes and native radio", () => {
    const wrapper = mount(Radio);

    expect(wrapper.classes()).toContain("sc-radio");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.find("input.sc-radio__input").exists()).toBe(true);
    expect(wrapper.find("input").attributes("type")).toBe("radio");
  });

  test("applies size classes", () => {
    const wrapper = mount(Radio, {
      props: { size: "lg" },
    });

    expect(wrapper.classes()).toContain("st-lg");
    expect(wrapper.classes()).not.toContain("st-md");
  });

  test("disabled applies class and disables input", () => {
    const wrapper = mount(Radio, {
      props: { disabled: true },
    });

    expect(wrapper.classes()).toContain("st-disabled");
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
  });

  test("v-model:checked updates on change", async () => {
    const wrapper = mount(Radio, {
      props: { checked: false },
    });

    const input = wrapper.find("input");
    expect((input.element as HTMLInputElement).checked).toBe(false);

    await input.setValue(true);
    expect(wrapper.emitted("update:checked")?.at(-1)).toEqual([true]);
  });

  test("label prop renders label text", () => {
    const wrapper = mount(Radio, {
      props: { label: "选项 A" },
    });

    expect(wrapper.find(".sc-radio__label").text()).toBe("选项 A");
  });

  test("default slot overrides label text", () => {
    const wrapper = mount(Radio, {
      props: { label: "prop" },
      slots: { default: "slot label" },
    });

    expect(wrapper.find(".sc-radio__label").text()).toBe("slot label");
  });

  test("no label span when label and slot are empty", () => {
    const wrapper = mount(Radio);

    expect(wrapper.find(".sc-radio__label").exists()).toBe(false);
  });

  test("falls through common attrs to native input", () => {
    const wrapper = mount(Radio, {
      attrs: {
        name: "fruit",
        value: "apple",
        id: "radio-1",
      },
    });

    const input = wrapper.find("input");
    expect(input.attributes("name")).toBe("fruit");
    expect(input.attributes("value")).toBe("apple");
    expect(input.attributes("id")).toBe("radio-1");
  });

  test("is-checked class follows checked model", async () => {
    const wrapper = mount(Radio, {
      props: { checked: false },
    });

    expect(wrapper.classes()).not.toContain("is-checked");
    expect(wrapper.vm.state.visualState).toBe("unchecked");

    await wrapper.setProps({ checked: true });
    await nextTick();
    expect(wrapper.classes()).toContain("is-checked");
    expect(wrapper.vm.state.visualState).toBe("checked");
  });

  test("exposes focus blur setCheck", async () => {
    const wrapper = mount(Radio, {
      props: { checked: false },
      attachTo: document.body,
    });

    const input = wrapper.find("input").element as HTMLInputElement;

    wrapper.vm.api.focus();
    expect(document.activeElement).toBe(input);

    wrapper.vm.api.blur();
    expect(document.activeElement).not.toBe(input);

    wrapper.vm.api.setCheck(true);
    await nextTick();
    expect(wrapper.emitted("update:checked")?.at(-1)).toEqual([true]);

    wrapper.unmount();
  });

  test("setCheck is no-op when disabled", async () => {
    const wrapper = mount(Radio, {
      props: { checked: false, disabled: true },
    });

    wrapper.vm.api.setCheck(true);
    await nextTick();
    expect(wrapper.emitted("update:checked")).toBeUndefined();
  });

  test("root is label wrapping input for a11y association", () => {
    const wrapper = mount(Radio, {
      props: { label: "选项" },
    });

    expect(wrapper.element.tagName.toLowerCase()).toBe("label");
    expect(wrapper.find(".sc-radio__control input[type='radio']").exists()).toBe(
      true,
    );
  });
});
