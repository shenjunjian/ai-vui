import {
  reactive,
  computed,
  watch,
  nextTick,
  useId,
  type InputHTMLAttributes,
} from "vue";
import type { InputCtx, InputOption } from "./input.vue";
import { callWithGuard } from "../../utils/promiseHelper.ts";
import { useTimer } from "../../hooks/useTimer.ts";
import { usePopper } from "../../hooks/usePopper.ts";
import { isFunction } from "@vue/shared";

const DEBOUNCE_MS = 300;

function normalizeItems(items: string[] | InputOption[]): InputOption[] {
  return items.map((item) =>
    typeof item === "string" ? { label: item } : { label: item.label },
  );
}

function filterStaticItems(
  items: string[] | InputOption[],
  query: string,
): InputOption[] {
  const q = query.trim().toLowerCase();
  const normalized = normalizeItems(items);
  if (!q) return [];
  return normalized.filter((item) => item.label.toLowerCase().includes(q));
}

export default function useVm(ctx: InputCtx) {
  const { props, models, refs, emit, attrs } = ctx;

  const inputId = useId();
  const filteredItems = reactive<InputOption[]>([]);
  const activeIndexState = reactive({ value: 0 });
  let matchSeq = 0;

  const popper = usePopper({
    reference: null,
    popper: null,
    show: false,
    placement: "bottom-start",
    arrowVisible: false,
    animate: true,
    ...(props.popperOption ?? {}),
  });

  watch(
    () => refs.rootRef.value,
    (el) => {
      popper.reference = el;
    },
    { immediate: true },
  );

  watch(
    () => refs.popperRef.value,
    (el) => {
      popper.popper = el;
    },
    { immediate: true },
  );

  watch(
    () => props.popperOption,
    (opt) => {
      if (!opt) return;
      Object.assign(popper, opt);
    },
    { deep: true },
  );

  const sizeClass = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: "st-sm",
      md: "st-md",
      lg: "st-lg",
    };
    return sizeMap[props.size] || "st-md";
  });

  const themeClass = computed(() => {
    if (!props.theme) return "st-control";
    const themeMap: Record<string, string> = {
      dark: "st-dark",
      success: "st-success",
      info: "st-info",
      warn: "st-warn",
      error: "st-error",
    };
    return themeMap[props.theme] || "st-control";
  });

  const inputType = computed(() => (props.password ? "password" : "text"));

  const showClear = computed(
    () =>
      props.clearable &&
      !props.disabled &&
      !!models.modelValue.value &&
      models.modelValue.value.length > 0,
  );

  const charCountText = computed(() => {
    const len = models.modelValue.value?.length ?? 0;
    const max = attrs.maxlength;
    if (max != null && max !== "") {
      return `${len}/${max}`;
    }
    return String(len);
  });

  const inputAttrs = computed(() => {
    const {
      class: _c,
      style: _s,
      type: _t,
      disabled: _d,
      value: _v,
      ...rest
    } = attrs as InputHTMLAttributes & Record<string, unknown>;
    return rest;
  });

  const showLabel = computed(
    () => props.variant === "line" && !!props.label,
  );

  const isFilled = computed(
    () => !!models.modelValue.value && models.modelValue.value.length > 0,
  );

  const rootClass = computed(() => [
    sizeClass.value,
    themeClass.value,
    {
      "is-line": props.variant === "line",
      "is-filled": isFilled.value,
      "st-disabled": props.disabled,
      "is-clearable": showClear.value,
      "is-pop-open": popper.show,
    },
  ]);

  const popVisible = computed(() => popper.show);

  function closeSuggest() {
    popper.show = false;
    filteredItems.splice(0, filteredItems.length);
    activeIndexState.value = 0;
  }

  function openSuggest(items: InputOption[]) {
    filteredItems.splice(0, filteredItems.length, ...items);
    if (!items.length) {
      closeSuggest();
      return;
    }
    activeIndexState.value = 0;
    popper.show = true;
  }

  async function matchSuggest(query: string) {
    const seq = ++matchSeq;
    if (props.disabled) {
      if (seq === matchSeq) closeSuggest();
      return;
    }

    const source = props.popItems;
    if (!source || (Array.isArray(source) && source.length === 0)) {
      if (seq === matchSeq) closeSuggest();
      return;
    }

    let items: InputOption[] = [];
    if (isFunction(source)) {
      const q = query.trim();
      if (!q) {
        if (seq === matchSeq) closeSuggest();
        return;
      }
      try {
        const result = await source(query);
        if (seq !== matchSeq) return;
        items = normalizeItems(result ?? []);
      } catch {
        if (seq !== matchSeq) return;
        items = [];
      }
    } else {
      items = filterStaticItems(source, query);
    }

    if (seq === matchSeq) openSuggest(items);
  }

  const { start: debounceMatchRaw, stop: stopMatchRaw } = useTimer(
    (query: string) => {
      void matchSuggest(query);
    },
    DEBOUNCE_MS,
  );

  function debounceMatch(query: string) {
    return debounceMatchRaw(query).catch(() => undefined);
  }

  function stopMatch() {
    stopMatchRaw();
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    models.modelValue.value = target.value;
    void debounceMatch(target.value);
  }

  function selectItem(item: InputOption) {
    models.modelValue.value = item.label;
    closeSuggest();
    stopMatch();
    nextTick(() => {
      refs.inputRef.value?.focus();
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!popper.show || !filteredItems.length) {
      if (event.key === "Escape") {
        closeSuggest();
      }
      return;
    }

    const len = filteredItems.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndexState.value = (activeIndexState.value + 1) % len;
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndexState.value = (activeIndexState.value - 1 + len) % len;
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      const item = filteredItems[activeIndexState.value];
      if (item) {
        if (event.key === "Enter") event.preventDefault();
        selectItem(item);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeSuggest();
    }
  }

  function handleFocus() {
    if (models.modelValue.value) {
      void debounceMatch(models.modelValue.value);
    }
  }

  function handleBlur() {
    nextTick(() => {
      closeSuggest();
      stopMatch();
    });
  }

  function focus() {
    refs.inputRef.value?.focus();
  }

  function blur() {
    refs.inputRef.value?.blur();
  }

  function selectall() {
    refs.inputRef.value?.select();
  }

  function doClear() {
    models.modelValue.value = "";
    closeSuggest();
    nextTick(() => {
      emit("cleared");
      refs.inputRef.value?.focus();
    });
  }

  function clear() {
    if (props.disabled || !models.modelValue.value) return;
    callWithGuard(props.beforeClear ?? true, () => {
      doClear();
    });
  }

  const activeIndex = computed(() => activeIndexState.value);

  const state = reactive({
    sizeClass,
    themeClass,
    rootClass,
    inputType,
    showClear,
    charCountText,
    inputAttrs,
    filteredItems,
    activeIndex,
    popVisible,
    inputId,
    showLabel,
  });

  const api = {
    handleInput,
    handleKeydown,
    handleFocus,
    handleBlur,
    selectItem,
    focus,
    blur,
    clear,
    selectall,
  };

  return { state, api };
}
