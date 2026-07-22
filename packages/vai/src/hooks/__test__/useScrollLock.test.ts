import { describe, expect, test, beforeEach, afterEach, vi } from "vite-plus/test";
import { defineComponent, h } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { useScrollLock, resetScrollLockForTest } from "../useScrollLock.ts";

function mountUseScrollLock() {
  let api!: ReturnType<typeof useScrollLock>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useScrollLock();
        return () => h("div");
      },
    }),
  );
  return { api, wrapper };
}

describe("useScrollLock", () => {
  let wrappers: VueWrapper[] = [];
  let originalInnerWidth: number;

  beforeEach(() => {
    wrappers = [];
    const html = document.documentElement;
    const body = document.body;
    body.style.overflow = "";
    body.style.paddingRight = "";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: html.clientWidth + 16,
    });
    vi.spyOn(window, "scrollTo").mockImplementation(((...args: unknown[]) => {
      const [a, b] = args;
      if (typeof a === "number" && typeof b === "number") {
        Object.defineProperty(window, "scrollY", {
          configurable: true,
          value: b,
        });
        return;
      }
      if (a && typeof a === "object" && "top" in a) {
        Object.defineProperty(window, "scrollY", {
          configurable: true,
          value: (a as ScrollToOptions).top ?? 0,
        });
      }
    }) as typeof window.scrollTo);
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    wrappers = [];
    resetScrollLockForTest();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
    });
    const body = document.body;
    body.style.overflow = "";
    body.style.paddingRight = "";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    vi.restoreAllMocks();
  });

  test("已滚动时用 fixed 冻结视口，并补偿 padding-right", () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 420,
    });
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-420px");
    expect(document.body.style.paddingRight).toBe("16px");
  });

  test("仅有滚动条、scrollY=0 时同样 fixed 冻结，并补 padding", () => {
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("0px");
    expect(document.body.style.paddingRight).toBe("16px");
  });

  test("无滚动条时仍 fixed 冻结，不补 padding", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: document.documentElement.clientWidth,
    });
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();

    expect(api.isLocked.value).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.paddingRight).toBe("");
  });

  test("scrollbar-gutter: stable 时不补 padding", () => {
    const html = document.documentElement;
    const original = html.style.scrollbarGutter;
    html.style.scrollbarGutter = "stable";
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();

    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.paddingRight).toBe("");

    html.style.scrollbarGutter = original;
  });

  test("unlock 恢复样式并 scrollTo", () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 280,
    });
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();
    api.unlock();

    expect(document.body.style.position).toBe("");
    expect(document.body.style.paddingRight).toBe("");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 280);
  });

  test("lock / unlock 对本实例幂等", () => {
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();
    api.lock();
    expect(document.body.style.paddingRight).toBe("16px");

    api.unlock();
    api.unlock();
    expect(document.body.style.paddingRight).toBe("");
  });

  test("多层引用计数：最后一次 unlock 才恢复", () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 100,
    });
    const a = mountUseScrollLock();
    const b = mountUseScrollLock();
    wrappers.push(a.wrapper, b.wrapper);

    a.api.lock();
    b.api.lock();
    expect(document.body.style.position).toBe("fixed");

    a.api.unlock();
    expect(document.body.style.position).toBe("fixed");
    expect(window.scrollTo).not.toHaveBeenCalled();

    b.api.unlock();
    expect(document.body.style.position).toBe("");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 100);
  });

  test("卸载时自动 unlock", () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 50,
    });
    const { api, wrapper } = mountUseScrollLock();
    api.lock();

    wrapper.unmount();
    expect(api.isLocked.value).toBe(false);
    expect(document.body.style.position).toBe("");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 50);
  });

  test("恢复原先已有的 inline overflow / body paddingRight", () => {
    const body = document.body;
    body.style.overflow = "scroll";
    body.style.paddingRight = "8px";

    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();
    expect(body.style.overflow).toBe("hidden");
    expect(body.style.paddingRight).toBe("24px");

    api.unlock();
    expect(body.style.overflow).toBe("scroll");
    expect(body.style.paddingRight).toBe("8px");
  });
});
