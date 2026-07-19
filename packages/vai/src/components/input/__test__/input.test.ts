import { describe, expect, test, vi, beforeEach, afterEach } from "vite-plus/test";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Input from "../input.vue";

function patchPopoverApi(el: HTMLElement) {
  let open = false;
  Object.defineProperty(el, "popover", {
    configurable: true,
    get: () => el.getAttribute("popover"),
    set: (v: string | null) => {
      if (v == null) el.removeAttribute("popover");
      else el.setAttribute("popover", v);
    },
  });
  Object.defineProperty(el, "matches", {
    configurable: true,
    value: (selector: string) => {
      if (selector === ":popover-open") return open;
      return HTMLElement.prototype.matches.call(el, selector);
    },
  });
  el.showPopover = () => {
    if (open) return;
    open = true;
    el.dispatchEvent(
      Object.assign(new Event("toggle"), {
        newState: "open",
        oldState: "closed",
      }),
    );
  };
  el.hidePopover = () => {
    if (!open) return;
    open = false;
    el.dispatchEvent(
      Object.assign(new Event("toggle"), {
        newState: "closed",
        oldState: "open",
      }),
    );
  };
}

describe("Input", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders with default classes", () => {
    const wrapper = mount(Input);

    expect(wrapper.classes()).toContain("sc-input");
    expect(wrapper.classes()).toContain("st-md");
    expect(wrapper.classes()).toContain("st-control");
    expect(wrapper.find("input.sc-input__inner").exists()).toBe(true);
    expect(wrapper.find("input").attributes("type")).toBe("text");
  });

  test("applies size and theme classes", () => {
    const wrapper = mount(Input, {
      props: { size: "lg", theme: "error" },
    });

    expect(wrapper.classes()).toContain("st-lg");
    expect(wrapper.classes()).toContain("st-error");
    expect(wrapper.classes()).not.toContain("st-control");
  });

  test("password prop sets input type", async () => {
    const wrapper = mount(Input, {
      props: { password: true },
    });

    expect(wrapper.find("input").attributes("type")).toBe("password");

    await wrapper.setProps({ password: false });
    expect(wrapper.find("input").attributes("type")).toBe("text");
  });

  test("disabled applies class and disables input", () => {
    const wrapper = mount(Input, {
      props: { disabled: true },
    });

    expect(wrapper.classes()).toContain("st-disabled");
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
  });

  test("v-model updates on input", async () => {
    const wrapper = mount(Input, {
      props: { modelValue: "hi" },
    });

    const input = wrapper.find("input");
    expect((input.element as HTMLInputElement).value).toBe("hi");

    await input.setValue("hello");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["hello"]);
  });

  test("falls through common attrs to native input", () => {
    const wrapper = mount(Input, {
      attrs: {
        placeholder: "请输入",
        maxlength: "10",
        name: "username",
      },
    });

    const input = wrapper.find("input");
    expect(input.attributes("placeholder")).toBe("请输入");
    expect(input.attributes("maxlength")).toBe("10");
    expect(input.attributes("name")).toBe("username");
  });

  test("charCount shows length and maxlength", async () => {
    const wrapper = mount(Input, {
      props: { modelValue: "abc", charCount: true },
      attrs: { maxlength: "10" },
    });

    expect(wrapper.find(".sc-input__count").text()).toBe("3/10");

    await wrapper.setProps({ modelValue: "abcd" });
    expect(wrapper.find(".sc-input__count").text()).toBe("4/10");
  });

  test("prefix and suffix slots render in order", () => {
    const wrapper = mount(Input, {
      props: { charCount: true, modelValue: "a", clearable: true },
      slots: {
        prefix: '<span class="p">P</span>',
        suffix: '<span class="s">S</span>',
      },
    });

    const html = wrapper.html();
    const prefixIdx = html.indexOf('class="p"');
    const countIdx = html.indexOf("sc-input__count");
    const suffixIdx = html.indexOf('class="s"');
    const clearIdx = html.indexOf("sc-input__clear");

    expect(prefixIdx).toBeGreaterThan(-1);
    expect(countIdx).toBeGreaterThan(prefixIdx);
    expect(suffixIdx).toBeGreaterThan(countIdx);
    expect(clearIdx).toBeGreaterThan(suffixIdx);
  });

  test("clearable shows clear button and emits cleared", async () => {
    const wrapper = mount(Input, {
      props: { modelValue: "text", clearable: true },
    });

    const clearBtn = wrapper.find(".sc-input__clear");
    expect(clearBtn.exists()).toBe(true);
    expect(clearBtn.attributes("aria-label")).toBe("清除");

    await clearBtn.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);
    expect(wrapper.emitted("cleared")).toHaveLength(1);
  });

  test("beforeClear returning false cancels clear", async () => {
    const beforeClear = vi.fn(() => false);
    const wrapper = mount(Input, {
      props: { modelValue: "keep", clearable: true, beforeClear },
    });

    await wrapper.find(".sc-input__clear").trigger("click");
    await flushPromises();

    expect(beforeClear).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("cleared")).toBeUndefined();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  test("beforeClear promise reject cancels clear", async () => {
    const beforeClear = vi.fn(() => Promise.reject(new Error("no")));
    const wrapper = mount(Input, {
      props: { modelValue: "keep", clearable: true, beforeClear },
    });

    await wrapper.find(".sc-input__clear").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("cleared")).toBeUndefined();
  });

  test("exposes focus blur clear selectall", async () => {
    const wrapper = mount(Input, {
      props: { modelValue: "abc", clearable: true },
      attachTo: document.body,
    });

    const input = wrapper.find("input").element as HTMLInputElement;
    const selectSpy = vi.spyOn(input, "select");

    wrapper.vm.api.focus();
    expect(document.activeElement).toBe(input);

    wrapper.vm.api.selectall();
    expect(selectSpy).toHaveBeenCalled();

    wrapper.vm.api.blur();
    expect(document.activeElement).not.toBe(input);

    wrapper.vm.api.clear();
    await flushPromises();
    expect(wrapper.emitted("cleared")).toHaveLength(1);

    wrapper.unmount();
  });

  test("autocomplete filters popItems after debounce and selects on Enter", async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: "",
        popItems: ["apple", "apricot", "banana"],
      },
      attachTo: document.body,
    });

    const suggest = wrapper.find(".sc-input__suggest")
      .element as HTMLElement;
    patchPopoverApi(suggest);

    await wrapper.find("input").setValue("ap");
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();
    await nextTick();

    expect(wrapper.vm.state.popVisible).toBe(true);
    expect(wrapper.vm.state.filteredItems.map((i) => i.label)).toEqual([
      "apple",
      "apricot",
    ]);

    await wrapper.find("input").trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.vm.state.activeIndex).toBe(1);

    await wrapper.find("input").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["apricot"]);
    expect(wrapper.vm.state.popVisible).toBe(false);

    wrapper.unmount();
  });

  test("autocomplete closes when no matches", async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: "",
        popItems: ["apple", "banana"],
      },
      attachTo: document.body,
    });

    patchPopoverApi(
      wrapper.find(".sc-input__suggest").element as HTMLElement,
    );

    await wrapper.find("input").setValue("zzz");
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(wrapper.vm.state.popVisible).toBe(false);
    expect(wrapper.vm.state.filteredItems).toHaveLength(0);

    wrapper.unmount();
  });

  test("async popItems resolver", async () => {
    const popItems = vi.fn(async (query: string) =>
      ["Vue", "Vite", "Vitest"].filter((x) =>
        x.toLowerCase().includes(query.toLowerCase()),
      ),
    );

    const wrapper = mount(Input, {
      props: { modelValue: "", popItems },
      attachTo: document.body,
    });

    patchPopoverApi(
      wrapper.find(".sc-input__suggest").element as HTMLElement,
    );

    await wrapper.find("input").setValue("vi");
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(popItems).toHaveBeenCalledWith("vi");
    expect(wrapper.vm.state.filteredItems.map((i) => i.label)).toEqual([
      "Vite",
      "Vitest",
    ]);

    wrapper.unmount();
  });

  test("selects item by mousedown", async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: "a",
        popItems: [{ label: "alpha" }, { label: "beta" }],
      },
      attachTo: document.body,
    });

    patchPopoverApi(
      wrapper.find(".sc-input__suggest").element as HTMLElement,
    );

    await wrapper.find("input").setValue("a");
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();
    await nextTick();

    const items = wrapper.findAll(".sc-input__suggest-item");
    expect(items.length).toBeGreaterThan(0);
    await items[0]!.trigger("mousedown");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["alpha"]);

    wrapper.unmount();
  });
});
