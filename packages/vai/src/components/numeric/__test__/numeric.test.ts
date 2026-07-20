import { describe, expect, test } from "vite-plus/test";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Numeric from "../numeric.vue";

describe("Numeric", () => {
  test("renders with default classes and controls", () => {
    const wrapper = mount(Numeric);

    expect(wrapper.classes()).toContain("v-numeric");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).toContain("st-control");
    expect(wrapper.classes()).toContain("is-controls");
    expect(wrapper.find("input.v-numeric__inner").exists()).toBe(true);
    expect(wrapper.find("input").attributes("type")).toBe("number");
    expect(wrapper.find(".v-numeric__btn--minus").exists()).toBe(true);
    expect(wrapper.find(".v-numeric__btn--plus").exists()).toBe(true);
    expect(wrapper.find(".ci-minus1").exists()).toBe(true);
    expect(wrapper.find(".ci-plus1").exists()).toBe(true);
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(Numeric, {
      props: { size: "lg", theme: "error" },
    });

    expect(wrapper.classes()).toContain("st-lg");
    expect(wrapper.classes()).toContain("st-error");
    expect(wrapper.classes()).not.toContain("st-control");
  });

  test("disabled applies class and disables input / buttons", () => {
    const wrapper = mount(Numeric, {
      props: { disabled: true },
    });

    expect(wrapper.classes()).toContain("st-disabled");
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    expect(
      wrapper.find(".v-numeric__btn--minus").attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.find(".v-numeric__btn--plus").attributes("disabled"),
    ).toBeDefined();
  });

  test("falls through min/max/step to native input", () => {
    const wrapper = mount(Numeric, {
      attrs: { min: "0", max: "10", step: "0.5", name: "qty" },
    });

    const input = wrapper.find("input");
    expect(input.attributes("min")).toBe("0");
    expect(input.attributes("max")).toBe("10");
    expect(input.attributes("step")).toBe("0.5");
    expect(input.attributes("name")).toBe("qty");
  });

  test("v-model updates on input and empty becomes NaN", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 3 },
    });

    const input = wrapper.find("input");
    expect((input.element as HTMLInputElement).value).toBe("3");

    await input.setValue("12");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe(12);

    await input.setValue("");
    const cleared = wrapper.emitted("update:modelValue")?.at(-1)?.[0] as number;
    expect(Number.isNaN(cleared)).toBe(true);
  });

  test("emits input on typing and change on native change", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 1 },
    });

    const input = wrapper.find("input");
    const el = input.element as HTMLInputElement;
    el.value = "7";
    await input.trigger("input");
    expect(wrapper.emitted("input")?.at(-1)).toEqual([7]);
    expect(wrapper.emitted("change")).toBeUndefined();

    await input.trigger("change");
    expect(wrapper.emitted("change")?.at(-1)).toEqual([7]);
  });

  test("emits input and change together on control click", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 1 },
      attrs: { step: "1" },
    });

    await wrapper.find(".v-numeric__btn--plus").trigger("click");
    expect(wrapper.emitted("input")?.at(-1)).toEqual([2]);
    expect(wrapper.emitted("change")?.at(-1)).toEqual([2]);
  });

  test("api setValue / clear emit input and change", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 1 },
      attrs: { min: "0", max: "10" },
    });

    wrapper.vm.api.setValue(8);
    await nextTick();
    expect(wrapper.emitted("input")?.at(-1)).toEqual([8]);
    expect(wrapper.emitted("change")?.at(-1)).toEqual([8]);

    wrapper.vm.api.clear();
    await nextTick();
    expect(Number.isNaN(wrapper.emitted("input")?.at(-1)?.[0])).toBe(true);
    expect(Number.isNaN(wrapper.emitted("change")?.at(-1)?.[0])).toBe(true);
  });

  test("increase / decrease by step", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 1 },
      attrs: { step: "2" },
    });

    await wrapper.find(".v-numeric__btn--plus").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([3]);

    await wrapper.setProps({ modelValue: 3 });
    await wrapper.find(".v-numeric__btn--minus").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([1]);
  });

  test("empty increase uses min, empty decrease uses max", async () => {
    const up = mount(Numeric, {
      props: { modelValue: Number.NaN },
      attrs: { min: "2", max: "9" },
    });

    await up.find(".v-numeric__btn--plus").trigger("click");
    expect(up.emitted("update:modelValue")?.at(-1)).toEqual([2]);
    up.unmount();

    const down = mount(Numeric, {
      props: { modelValue: Number.NaN },
      attrs: { min: "2", max: "9" },
    });

    await down.find(".v-numeric__btn--minus").trigger("click");
    expect(down.emitted("update:modelValue")?.at(-1)).toEqual([9]);
    down.unmount();
  });

  test("clamps at max without loop", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 9, loop: false },
      attrs: { min: "0", max: "10", step: "2" },
    });

    await wrapper.find(".v-numeric__btn--plus").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([10]);
  });

  test("disables control at bounds when loop is false", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 0, loop: false },
      attrs: { min: "0", max: "10" },
    });

    expect(
      wrapper.find(".v-numeric__btn--minus").attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.find(".v-numeric__btn--plus").attributes("disabled"),
    ).toBeUndefined();

    await wrapper.setProps({ modelValue: 10 });
    expect(
      wrapper.find(".v-numeric__btn--plus").attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.find(".v-numeric__btn--minus").attributes("disabled"),
    ).toBeUndefined();

    await wrapper.find(".v-numeric__btn--plus").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  test("does not disable controls at bounds when loop is true", () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 10, loop: true },
      attrs: { min: "0", max: "10" },
    });

    expect(
      wrapper.find(".v-numeric__btn--plus").attributes("disabled"),
    ).toBeUndefined();
    expect(
      wrapper.find(".v-numeric__btn--minus").attributes("disabled"),
    ).toBeUndefined();
  });

  test("loops from max to min when loop is true", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 10, loop: true },
      attrs: { min: "0", max: "10", step: "1" },
    });

    await wrapper.find(".v-numeric__btn--plus").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([0]);

    await wrapper.setProps({ modelValue: 0 });
    await wrapper.find(".v-numeric__btn--minus").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([10]);
  });

  test("unit hides controls and shows unit text", () => {
    const wrapper = mount(Numeric, {
      props: { unit: "kg", controls: true, modelValue: 1 },
    });

    expect(wrapper.classes()).toContain("is-unit");
    expect(wrapper.classes()).not.toContain("is-controls");
    expect(wrapper.find(".v-numeric__btn").exists()).toBe(false);
    expect(wrapper.find(".v-numeric__unit").text()).toBe("kg");
  });

  test("controls=false hides buttons", () => {
    const wrapper = mount(Numeric, {
      props: { controls: false },
    });

    expect(wrapper.find(".v-numeric__btn").exists()).toBe(false);
    expect(wrapper.classes()).not.toContain("is-controls");
  });

  test("ArrowUp / ArrowDown step value", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 5 },
      attrs: { step: "1" },
    });

    await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([6]);

    await wrapper.setProps({ modelValue: 6 });
    await wrapper.find("input").trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([5]);
  });

  test("parse handles paste", async () => {
    const wrapper = mount(Numeric, {
      props: {
        modelValue: 0,
        parse: (str: string) => Number(str.replace(/[^\d.-]/g, "")),
      },
    });

    const input = wrapper.find("input");
    await input.trigger("paste", {
      clipboardData: {
        getData: () => "约 42 kg",
      },
    });

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([42]);
  });

  test("exposed api: clear / setValue / focus / blur / selectall", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 8 },
      attachTo: document.body,
    });

    const api = wrapper.vm.api;
    api.clear();
    await nextTick();
    expect(
      Number.isNaN(wrapper.emitted("update:modelValue")?.at(-1)?.[0]),
    ).toBe(true);

    api.setValue(4);
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([4]);

    await wrapper.setProps({ modelValue: 4 });
    api.focus();
    expect(document.activeElement).toBe(wrapper.find("input").element);

    // type=number 在部分环境不支持 selection，仅保证可调用
    expect(() => api.selectall()).not.toThrow();

    api.blur();
    expect(document.activeElement).not.toBe(wrapper.find("input").element);

    wrapper.unmount();
  });

  test("setValue clamps to max", async () => {
    const wrapper = mount(Numeric, {
      props: { modelValue: 1 },
      attrs: { min: "0", max: "5" },
    });

    wrapper.vm.api.setValue(99);
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([5]);
  });

  test("buttons have a11y labels", () => {
    const wrapper = mount(Numeric);

    expect(
      wrapper.find(".v-numeric__btn--minus").attributes("aria-label"),
    ).toBe("减少");
    expect(wrapper.find(".v-numeric__btn--plus").attributes("aria-label")).toBe(
      "增加",
    );
  });
});
