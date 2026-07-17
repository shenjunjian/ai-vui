const toMs = (s: string) => {
  if (s === 'auto') return 0
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

/** 获取元素的当前动画时长，参考 Vue的Transition 的源码实现。 注：无论css中单位是 ms/s, getComputedStyle返回的单位都是 s  */
export const getTransitionInfo = (el: HTMLElement) => {
  const styles = window.getComputedStyle(el)
  // 先判断transition
  let timeout = toMs(styles.transitionDelay) + toMs(styles.transitionDuration)
  if (timeout) return timeout

  // 再判断 animation
  timeout = toMs(styles.animationDelay) + toMs(styles.animationDuration)
  if (timeout) return timeout

  return 0
}

/** 给元素设置或移除多个类名的字符串
 * @example
 * applyClass(el, 'aa   bb cc', true) // 忽略多余空格，添加3个类名
 *
 * @param el  目标元素
 * @param classes 字符串形式的类名，多类名以空格，逗号分隔
 * @param isAdd 是否添加上， false时，会移除类名
 */
export const applyClass = (el: HTMLElement, classes: string, isAdd = true) => {
  const list = classes.replaceAll(',', ' ').split(' ')
  if (isAdd) {
    el.classList.add(...list)
  } else {
    el.classList.remove(...list)
  }
}
