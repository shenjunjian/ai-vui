export { applyClass, getTransitionInfo } from "./cssHelper";
export { proxyData, transferData, chunk, clamp, random } from "./dataHelper";
export {
  resolvePromise,
  callWithGuard,
  $delayValue,
  $delay,
} from "./promiseHelper";
export { $session, $local, $cache, useAutoStore } from "./storageHelper";
export { runInWorker } from "./workerHelper/index";
export * from "./blobHelper";
export * from "./bufferHelper";
export * from "./vueHelper";

// 从 @vue/shared 借用基本函数
export {
  EMPTY_OBJ,
  EMPTY_ARR,
  NOOP,
  NO,
  isArray,
  isMap,
  isSet,
  isDate,
  isRegExp,
  isFunction,
  isString,
  isSymbol,
  isObject,
  isPromise,
  camelize, // 转驼峰
  hyphenate, // 转连字符
  capitalize, // 大写首字母
} from "@vue/shared";

export const version = "4.0.0";

/** 永远返回true */
export const OK = () => true;

/** 是否为boolean */
export const isBoolean = (val: any) => typeof val === "boolean";
/** 是否为 undefined  */
export const isUndefined = (val: any) => typeof val === "undefined";
