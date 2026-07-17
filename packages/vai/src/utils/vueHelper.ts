import { isFunction, isPromise } from '@vue/shared'
import { ref, type Component, type VNode } from 'vue'

/** RenderAble Content
 * # 可渲染内容项
 * + 普通的字符串直接渲染，也是常见需求
 * + html 格式的字符串渲染，也是常见需求，甚至 MD 格式的渲染。
 * + Vnode,Component，或者 () => Vnode 也是
 *
 * 在Vue3中，<component> 可渲染`组件，VNode",也可以渲染`字符串`,但它是当成注册过的组件名或原生标签名来识别的。
 *
 * 在组件设计时，通常有3种方式让用户自定义内容。
 * 1、插槽： 极灵活， 但与Vue框架耦合，不利于其它框架推广和低代码平台使用
 * 2、字符串属性： 简单，但不灵活。比如渲染成组件，或 html渲染
 * 3、函数属性： 通过执行函数，得到返回的字符串或vnode， 再进行渲染到组件中去。
 *
 * 比如： <template #content>   content='xxx'  contentRender = ()=> xxx,
 * 问题1： 属性就会膨胀。  如果组件中自定义的地方有点多， 那么属性就会膨胀，比如 title, content, footer,extra 是常的属性或插槽， 每个需要1个或多个实现就有点乱。
 * 问题2： 优先级不明确。 在上例中，到底哪个优先级最高？ 一般是插槽 > 函数 > 属性， 但严重依赖开发人员当时的设定。
 * 问题3： 异步渲染。 场景不多，但最好能支持。
 *
 * 所以我们需要一个极灵活，自由的渲染统一方案。
 */

/**
 * 当组件的属性，同时允许接收 string | VNode | Component | Function 等类型用于渲染到模板时，可以用该函数处理。
 * 它允许 Function 时，异步返回结果。
 *
 * 注： 虽然Vue允许函数做组件， 但是此处不允许。此处默认函数就是需要返回值的。
 *
 */
export const calcProp = /*@__PURE__*/ (prop: string | Function | VNode | Component) => {
  if (typeof prop === 'function') {
    const propResult = prop()
    if (isPromise(propResult)) {
      const unwrapProp = ref(null)
      propResult.then((value) => (unwrapProp.value = value))

      return unwrapProp
    } else {
      return propResult
    }
  }

  return prop
}

// TODO: 添加一个能渲染 string | <component>的自定义vue组件， 配合上面的calcProp.   RenderAble

// TODO: 做一个任意的slot， 以便动态渲染内容 （vue3, vapor都支持的方案）
