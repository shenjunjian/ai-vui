import { describe, expect, test, vi, beforeEach, afterEach } from "vite-plus/test";
import { defineComponent, h, nextTick } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { usePopper, type PopperOption } from "../usePopper.ts";

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
  el.matches = ((selectors: string) => {
    if (selectors === ":popover-open") return open;
    return Element.prototype.matches.call(el, selectors);
  }) as typeof el.matches;
}

function mountUsePopper(option: PopperOption = { reference: null, popper: null }) {
  let api!: ReturnType<typeof usePopper>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = usePopper(option);
      },
      render: () => h("div"),
    }),
  );
  return { api, wrapper };
}

describe("usePopper", () => {
  let reference: HTMLElement;
  let popper: HTMLElement;
  let wrappers: VueWrapper[] = [];

  beforeEach(() => {
    reference = document.createElement("button");
    popper = document.createElement("div");
    document.body.append(reference, popper);
    patchPopoverApi(popper);
    wrappers = [];
  });

  afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    reference.remove();
    popper.remove();
  });

  function setup(option: Omit<PopperOption, "reference" | "popper"> = {}) {
    const result = mountUsePopper({
      reference,
      popper,
      ...option,
    });
    wrappers.push(result.wrapper);
    return result.api;
  }

  test("returns defaults and merges option", async () => {
    const api = setup({ show: false, placement: "top" });
    await nextTick();

    expect(api.placement).toBe("top");
    expect(api.arrowVisible).toBe(true);
    expect(api.arrowSize).toBe(8);
    expect(api.arrowSafeOffset).toBe(8);
    expect(api.animate).toBe(true);
    expect(api.offset).toBe(0);
    expect(api.show).toBe(false);
  });

  test("binds popover + anchor-name and toggles showPopover", async () => {
    const api = setup();
    await nextTick();

    expect(popper.getAttribute("popover")).toBe("manual");
    expect(popper.classList.contains("vai-popper")).toBe(true);
    expect(reference.style.getPropertyValue("anchor-name")).toMatch(
      /^--vai-popper-/,
    );

    const showSpy = vi.spyOn(popper, "showPopover");
    const hideSpy = vi.spyOn(popper, "hidePopover");

    api.show = true;
    await nextTick();
    expect(showSpy).toHaveBeenCalled();

    api.show = false;
    await nextTick();
    expect(hideSpy).toHaveBeenCalled();
  });

  test("applies placement, gap and arrow styles", async () => {
    const api = setup({
      placement: "top",
      offset: [2, 4],
      arrowVisible: true,
      arrowSize: 8,
    });
    await nextTick();

    expect(popper.dataset.placement).toBe("top");
    expect(popper.style.getPropertyValue("position-area")).toBe("top");
    // base 8 + arrow 8 + away 4
    expect(popper.style.getPropertyValue("--vai-popper-gap")).toBe("20px");
    expect(popper.style.getPropertyValue("--vai-popper-cross")).toBe("2px");
    expect(popper.style.getPropertyValue("--vai-popper-arrow-size")).toBe("8px");
    expect(popper.classList.contains("vai-popper--arrow")).toBe(true);

    api.arrowSize = 12;
    await nextTick();
    // base 8 + arrow 12 + away 4
    expect(popper.style.getPropertyValue("--vai-popper-arrow-size")).toBe("12px");
    expect(popper.style.getPropertyValue("--vai-popper-gap")).toBe("24px");

    api.arrowVisible = false;
    await nextTick();
    expect(popper.classList.contains("vai-popper--arrow")).toBe(false);
    // base 8 + away 4（隐藏箭头时 arrowSize 不计入 gap）
    expect(popper.style.getPropertyValue("--vai-popper-gap")).toBe("12px");
  });

  test("maps *-start / *-end placements to correct position-area span", async () => {
    const api = setup({ placement: "bottom-start" });
    await nextTick();
    expect(popper.style.getPropertyValue("position-area")).toBe(
      "bottom span-right",
    );

    api.placement = "bottom-end";
    await nextTick();
    expect(popper.style.getPropertyValue("position-area")).toBe(
      "bottom span-left",
    );

    api.placement = "top-start";
    await nextTick();
    expect(popper.style.getPropertyValue("position-area")).toBe(
      "top span-right",
    );

    api.placement = "left-start";
    await nextTick();
    expect(popper.style.getPropertyValue("position-area")).toBe(
      "left span-bottom",
    );
  });

  test("applies customClass and animate flag", async () => {
    const api = setup({ customClass: "foo  bar", animate: false });
    await nextTick();

    expect(popper.classList.contains("foo")).toBe(true);
    expect(popper.classList.contains("bar")).toBe(true);
    expect(popper.classList.contains("vai-popper--no-animate")).toBe(true);

    api.customClass = "baz";
    api.animate = true;
    await nextTick();

    expect(popper.classList.contains("foo")).toBe(false);
    expect(popper.classList.contains("baz")).toBe(true);
    expect(popper.classList.contains("vai-popper--no-animate")).toBe(false);
  });

  test("autoHide closes on scroll", async () => {
    const api = setup({ autoHide: true, show: true });
    await nextTick();
    expect(api.show).toBe(true);

    document.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(api.show).toBe(false);
  });

  test("cleans up on unmount", async () => {
    const { api, wrapper } = mountUsePopper({
      reference,
      popper,
      show: true,
      customClass: "x",
      autoHide: true,
    });
    wrappers.push(wrapper);
    await nextTick();

    expect(api.show).toBe(true);
    const hideSpy = vi.spyOn(popper, "hidePopover");

    wrapper.unmount();
    wrappers = wrappers.filter((w) => w !== wrapper);

    expect(hideSpy).toHaveBeenCalled();
    expect(reference.style.getPropertyValue("anchor-name")).toBe("");
    expect(popper.classList.contains("vai-popper")).toBe(false);
    expect(popper.classList.contains("x")).toBe(false);
  });

  test("binds reference/popper assigned after init", async () => {
    const { api, wrapper } = mountUsePopper({
      reference: null,
      popper: null,
      show: false,
      placement: "bottom-start",
      arrowVisible: false,
    });
    wrappers.push(wrapper);
    await nextTick();

    expect(popper.getAttribute("popover")).toBeNull();

    api.reference = reference;
    api.popper = popper;
    await nextTick();

    expect(popper.getAttribute("popover")).toBe("manual");
    expect(popper.classList.contains("vai-popper")).toBe(true);
    expect(reference.style.getPropertyValue("anchor-name")).toMatch(
      /^--vai-popper-/,
    );
    expect(popper.style.getPropertyValue("position-area")).toBe(
      "bottom span-right",
    );

    const showSpy = vi.spyOn(popper, "showPopover");
    api.show = true;
    await nextTick();
    expect(showSpy).toHaveBeenCalled();
  });
});
