import { describe, expect, test, vi } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Checkbox from "../checkbox.vue";

describe("Checkbox", () => {
  test("renders with default classes and native checkbox", () => {
    const wrapper = mount(Checkbox);

    expect(wrapper.classes()).toContain("v-checkbox");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).toContain("st-control");
    expect(wrapper.find("input.v-checkbox__input").exists()).toBe(true);
    expect(wrapper.find("input").attributes("type")).toBe("checkbox");
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(Checkbox, {
      props: { size: "lg", theme: "error" },
    });

    expect(wrapper.classes()).toContain("st-lg");
    expect(wrapper.classes()).toContain("st-error");
    expect(wrapper.classes()).not.toContain("st-md");
    expect(wrapper.classes()).not.toContain("st-control");
  });

  test("disabled applies class and disables input", () => {
    const wrapper = mount(Checkbox, {
      props: { disabled: true },
    });

    expect(wrapper.classes()).toContain("st-disabled");
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
  });

  test("v-model:checked updates on change", async () => {
    const wrapper = mount(Checkbox, {
      props: { checked: false },
    });

    const input = wrapper.find("input");
    expect((input.element as HTMLInputElement).checked).toBe(false);

    await input.setValue(true);
    expect(wrapper.emitted("update:checked")?.at(-1)).toEqual([true]);
  });

  test("forwards native change listener", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Checkbox, {
      props: { checked: false },
      attrs: { onChange },
    });

    await wrapper.find("input").setValue(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("update:checked")?.at(-1)).toEqual([true]);
  });

  test("label prop renders label text", () => {
    const wrapper = mount(Checkbox, {
      props: { label: "同意协议" },
    });

    expect(wrapper.find(".v-checkbox__label").text()).toBe("同意协议");
  });

  test("default slot overrides label text", () => {
    const wrapper = mount(Checkbox, {
      props: { label: "prop" },
      slots: { default: "slot label" },
    });

    expect(wrapper.find(".v-checkbox__label").text()).toBe("slot label");
  });

  test("no label span when label and slot are empty", () => {
    const wrapper = mount(Checkbox);

    expect(wrapper.find(".v-checkbox__label").exists()).toBe(false);
  });

  test("falls through common attrs to native input", () => {
    const wrapper = mount(Checkbox, {
      attrs: {
        name: "agree",
        value: "yes",
        id: "cb-1",
      },
    });

    const input = wrapper.find("input");
    expect(input.attributes("name")).toBe("agree");
    expect(input.attributes("value")).toBe("yes");
    expect(input.attributes("id")).toBe("cb-1");
  });

  test("indeterminate sets input.indeterminate and visual class", async () => {
    const wrapper = mount(Checkbox, {
      props: { checked: true, indeterminate: true },
      attachTo: document.body,
    });

    await nextTick();
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    expect(wrapper.classes()).toContain("is-indeterminate");
    expect(wrapper.classes()).not.toContain("is-checked");
    expect(wrapper.vm.state.visualState).toBe("indeterminate");

    await wrapper.setProps({ indeterminate: false });
    await nextTick();
    expect(input.indeterminate).toBe(false);
    expect(wrapper.classes()).toContain("is-checked");
    expect(wrapper.vm.state.visualState).toBe("checked");

    wrapper.unmount();
  });

  test("exposes focus blur setCheck", async () => {
    const wrapper = mount(Checkbox, {
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
    const wrapper = mount(Checkbox, {
      props: { checked: false, disabled: true },
    });

    wrapper.vm.api.setCheck(true);
    await nextTick();
    expect(wrapper.emitted("update:checked")).toBeUndefined();
  });

  test("root is label wrapping input for a11y association", () => {
    const wrapper = mount(Checkbox, {
      props: { label: "选项" },
    });

    expect(wrapper.element.tagName.toLowerCase()).toBe("label");
    expect(wrapper.find(".v-checkbox__control input[type='checkbox']").exists()).toBe(
      true,
    );
  });
});
