import {
  reactive,
  computed,
  watch,
  nextTick,
  type InputHTMLAttributes,
} from "vue";
import type { NumericCtx, NumericOption } from "./numeric.vue";
import { useTimer } from "../../hooks/useTimer.ts";
import { usePopper } from "../../hooks/usePopper.ts";
import { isFunction } from "@vue/shared";

const DEBOUNCE_MS = 300;

function toNumber(value: unknown, fallback: number): number {
  if (value == null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function precisionOf(step: number): number {
  const s = String(step);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}

function fixPrecision(n: number, step: number): number {
  const p = precisionOf(step);
  return p > 0 ? Number(n.toFixed(p)) : n;
}

function isEmptyNumber(value: number | undefined | null): boolean {
  return value == null || Number.isNaN(value);
}

function sameNumber(a: number, b: number): boolean {
  return (Number.isNaN(a) && Number.isNaN(b)) || Object.is(a, b);
}

function normalizeItems(
  items: string[] | number[] | NumericOption[],
): NumericOption[] {
  return items.map((item) =>
    typeof item === "string" || typeof item === "number"
      ? { label: String(item) }
      : { label: item.label },
  );
}

function filterStaticItems(
  items: string[] | number[] | NumericOption[],
  query: string,
): NumericOption[] {
  const q = query.trim().toLowerCase();
  const normalized = normalizeItems(items);
  if (!q) return [];
  return normalized.filter((item) => item.label.toLowerCase().includes(q));
}

export default function useVm(ctx: NumericCtx) {
  const { props, models, refs, attrs, emit } = ctx;

  const filteredItems = reactive<NumericOption[]>([]);
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

  const showUnit = computed(() => !!props.unit);
  const showControls = computed(() => props.controls && !showUnit.value);

  const minusDisabled = computed(() => {
    if (props.disabled) return true;
    if (props.loop) return false;
    const { min, hasMin } = getBounds();
    const current = models.modelValue.value;
    return hasMin && !isEmptyNumber(current) && current <= min;
  });

  const plusDisabled = computed(() => {
    if (props.disabled) return true;
    if (props.loop) return false;
    const { max, hasMax } = getBounds();
    const current = models.modelValue.value;
    return hasMax && !isEmptyNumber(current) && current >= max;
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

  const displayValue = computed(() => {
    const v = models.modelValue.value;
    if (isEmptyNumber(v)) return "";
    return v;
  });

  const rootClass = computed(() => [
    sizeClass.value,
    themeClass.value,
    {
      "st-disabled": props.disabled,
      "is-controls": showControls.value,
      "is-unit": showUnit.value,
      "is-pop-open": popper.show,
    },
  ]);

  const popVisible = computed(() => popper.show);

  function getBounds() {
    const step = toNumber(attrs.step, 1);
    const hasMin = attrs.min != null && attrs.min !== "";
    const hasMax = attrs.max != null && attrs.max !== "";
    const min = hasMin ? toNumber(attrs.min, -Infinity) : -Infinity;
    const max = hasMax ? toNumber(attrs.max, Infinity) : Infinity;
    return { step, min, max, hasMin, hasMax };
  }

  function applyBound(value: number): number {
    const { min, max, hasMin, hasMax } = getBounds();
    if (!Number.isFinite(value)) return Number.NaN;

    if (props.loop && hasMin && hasMax) {
      if (value > max) return min;
      if (value < min) return max;
      return value;
    }

    let next = value;
    if (hasMin && next < min) next = min;
    if (hasMax && next > max) next = max;
    return next;
  }

  /** @param commit 为 true 时同时触发 change（增减 / api / 粘贴等） */
  let lastChangeValue = models.modelValue.value;

  function emitChange(value: number) {
    if (sameNumber(lastChangeValue, value)) return;
    lastChangeValue = value;
    emit("change", value);
  }

  function writeValue(value: number, commit = false) {
    const next = isEmptyNumber(value) ? Number.NaN : applyBound(value);
    const prev = models.modelValue.value;
    models.modelValue.value = next;
    if (!sameNumber(prev, next)) {
      emit("input", next);
    }
    if (commit) emitChange(next);
  }

  function closeSuggest() {
    popper.show = false;
    filteredItems.splice(0, filteredItems.length);
    activeIndexState.value = 0;
  }

  function openSuggest(items: NumericOption[]) {
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

    let items: NumericOption[] = [];
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

  function setValue(value: number) {
    if (props.disabled) return;
    writeValue(value, true);
  }

  function stepBy(direction: 1 | -1) {
    if (props.disabled) return;

    const { step, min, max, hasMin, hasMax } = getBounds();
    const current = models.modelValue.value;

    if (isEmptyNumber(current)) {
      writeValue(direction > 0 ? (hasMin ? min : 0) : hasMax ? max : 0, true);
      return;
    }

    writeValue(fixPrecision(current + direction * step, step), true);
  }

  function increase() {
    if (plusDisabled.value) return;
    closeSuggest();
    stopMatch();
    stepBy(1);
  }

  function decrease() {
    if (minusDisabled.value) return;
    closeSuggest();
    stopMatch();
    stepBy(-1);
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const next = target.valueAsNumber;
    writeValue(Number.isNaN(next) ? Number.NaN : next, false);
    void debounceMatch(target.value);
  }

  function handleChange() {
    emitChange(models.modelValue.value);
  }

  function selectItem(item: NumericOption) {
    const next = props.parse
      ? props.parse(item.label)
      : Number(item.label);
    writeValue(next, true);
    closeSuggest();
    stopMatch();
    nextTick(() => {
      refs.inputRef.value?.focus();
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (popper.show && filteredItems.length) {
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
      return;
    }

    if (event.key === "Escape") {
      closeSuggest();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      increase();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      decrease();
    }
  }

  function handleFocus() {
    const el = refs.inputRef.value;
    const query = el?.value ?? "";
    if (query) {
      void debounceMatch(query);
    }
  }

  function handleBlur() {
    nextTick(() => {
      closeSuggest();
      stopMatch();
    });
  }

  function handlePaste(event: ClipboardEvent) {
    if (!props.parse || props.disabled) return;
    event.preventDefault();
    const text = event.clipboardData?.getData("text") ?? "";
    writeValue(props.parse(text), true);
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

  function clear() {
    if (props.disabled) return;
    writeValue(Number.NaN, true);
    closeSuggest();
    stopMatch();
  }

  const activeIndex = computed(() => activeIndexState.value);

  const state = reactive({
    sizeClass,
    themeClass,
    rootClass,
    inputAttrs,
    displayValue,
    showControls,
    showUnit,
    minusDisabled,
    plusDisabled,
    filteredItems,
    activeIndex,
    popVisible,
  });

  const api = {
    handleInput,
    handleChange,
    handleKeydown,
    handlePaste,
    handleFocus,
    handleBlur,
    selectItem,
    focus,
    blur,
    clear,
    setValue,
    selectall,
    increase,
    decrease,
  };

  return { state, api };
}
