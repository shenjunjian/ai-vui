import { describe, expect, test, beforeEach, afterEach } from "vite-plus/test";
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
    html.style.overflow = "";
    body.style.overflow = "";
    body.style.paddingRight = "";
    originalInnerWidth = window.innerWidth;
    // 模拟存在 16px 纵向滚动条
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: html.clientWidth + 16,
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
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "";
    body.style.overflow = "";
    body.style.paddingRight = "";
  });

  test("lock 设置 overflow hidden，并在 body 上补偿 padding-right", () => {
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    expect(api.isLocked.value).toBe(false);
    api.lock();

    expect(api.isLocked.value).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe("16px");
    expect(document.documentElement.style.paddingRight).toBe("");
  });

  test("lock / unlock 对本实例幂等", () => {
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();
    api.lock();
    expect(api.isLocked.value).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");

    api.unlock();
    api.unlock();
    expect(api.isLocked.value).toBe(false);
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.paddingRight).toBe("");
  });

  test("多层引用计数：最后一次 unlock 才恢复", () => {
    const a = mountUseScrollLock();
    const b = mountUseScrollLock();
    wrappers.push(a.wrapper, b.wrapper);

    a.api.lock();
    b.api.lock();
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe("16px");

    a.api.unlock();
    expect(a.api.isLocked.value).toBe(false);
    expect(b.api.isLocked.value).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe("16px");

    b.api.unlock();
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.paddingRight).toBe("");
  });

  test("卸载时自动 unlock", () => {
    const { api, wrapper } = mountUseScrollLock();
    api.lock();
    expect(document.documentElement.style.overflow).toBe("hidden");

    wrapper.unmount();
    expect(api.isLocked.value).toBe(false);
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.paddingRight).toBe("");
  });

  test("无滚动条时不写 padding-right", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: document.documentElement.clientWidth,
    });
    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe("");
  });

  test("恢复原先已有的 inline overflow / body paddingRight", () => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "scroll";
    body.style.paddingRight = "8px";

    const { api, wrapper } = mountUseScrollLock();
    wrappers.push(wrapper);

    api.lock();
    expect(html.style.overflow).toBe("hidden");

    api.unlock();
    expect(html.style.overflow).toBe("scroll");
    expect(body.style.paddingRight).toBe("8px");
  });
});
