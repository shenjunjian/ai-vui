import { isObject, isArray, hasOwn } from "@vue/shared";
import { nanoid } from "nanoid";

const proxyDataSkipKey = /*@__PURE__*/ "__skip_proxy_data";
/**
 * 通过影射访问数据集， 建议不要回写数据集，见测试用例！
 * 比如级联表单，tree， select组件中，通过text-field, value-field， props 指定自定义数据的别名
 * @param data 待处理的数据对象，
 * @param mapping 影射规则
 * @param mapToSelf 影射后的数据仍然是待处理的数据,需要递归处理的情况，比如 children
 *
 * @example
 * let data = { text: '用户1', id:'1', children:[{text:'用户2',id:'2'}, {text:'用户3',id:'3'}]}
 * let mapping={ label:'text', value:'id', children:'sublist', disabled:'stopped'}
 *
 * let $data= proxyData(data,mapping, ['children'])
 *
 * $data.label
 * $data.value
 */
export function proxyData<D>(
  data: D,
  mapping: Record<string, string>,
  mapToSelf: string[] = ["children"], // 假设它就是数组的场景
): D {
  // 1、数组时
  if (isArray(data)) {
    return data.map((item) => proxyData(item, mapping, mapToSelf)) as D;
  }
  // 2、已经代理过一次了
  if (data[proxyDataSkipKey]) return data;

  // 3、代理当前data对象
  return new Proxy(data, {
    get: function (target, property: string, _receiver) {
      if (property === proxyDataSkipKey) return true;

      const realPropName = mapping[property] || property;

      if (mapToSelf.includes(property)) {
        const children = target[realPropName];
        if (isArray(children)) {
          return children.map((item) => proxyData(item, mapping, mapToSelf));
        } else if (isObject(children)) {
          return proxyData(children, mapping, mapToSelf);
        } else {
          return children;
        }
      } else {
        return target[realPropName];
      }
    },
    set: function (target, property, newValue, _receiver) {
      const realPropName = mapping[property] || property;

      target[realPropName] = newValue;

      return true;
    },
  }) as D;
}

/**
 * 原地的转换业务数据为另一种格式。【未校验属性冲突】
 * 使用场景：方便用户将业务数据转换为组件的数据，使用之后，再转换为业务自身格式的数据
 * @param data
 * @param mapping
 * @param mapToSelf
 * @param isRevert  是否反向转移
 *
 * @example
 * let data = { text: '用户1', id:'1', sublist:[{text:'用户2',id:'2'}, {text:'用户3',id:'3'}]}
 * let mapping={text:'label', id:'value', sublist:'children'}
 *
 * let newData = transferData(data, mapping, ['sublist'], false)
 * newData.value='用户1'
 * newData.label='1'
 *
 * let backData= transferData(newData, mapping, ['sublist'], true)
 * backData.text='用户1'
 * backData.id='1'
 *
 * @example【属性冲突】
 * let data = { text: '用户1', id:'1', value:'v1'}
 * let mapping={  id:'value' }
 * 以上场景， id 转移成value ,会直接覆盖原value。
 *
 * let mapping={ value:'__value',  id:'value' }    考虑这样写mapping进行规避
 */
export function transferData(
  data: any,
  mapping: Record<string, string>,
  mapToSelf: string[] = ["children"], // 假设它就是数组的场景
  isRevert = false,
): any {
  if (isArray(data)) {
    return data.map((item) => transferData(item, mapping, mapToSelf));
  }

  // isRevert为true时，要按照mapping的声明的倒序进行替换。
  const realMapping = isRevert
    ? Object.keys(mapping)
        .reverse()
        .map((key) => ({ from: mapping[key], to: key }))
    : Object.keys(mapping).map((key) => ({ from: key, to: mapping[key] }));

  // 循环data的属性  id->value  sublist->children
  realMapping.forEach(({ from, to }) => {
    if (!hasOwn(data, from)) return;

    data[to] = data[from];
    delete data[from];

    // 需要递归处理 data[to]
    if (mapToSelf.includes(from) || mapToSelf.includes(to)) {
      if (isArray(data[to])) {
        data[to] = data[to].map((item) =>
          transferData(item, mapping, mapToSelf, isRevert),
        );
      } else if (isObject(data[to])) {
        data[to] = transferData(data[to], mapping, mapToSelf, isRevert);
      }
    }
  });

  return data;
}

/** 将数组分成多段
 * @example
 * chunk([1,2..10], 3) // [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]
 */
export function chunk(data: any[], size: number) {
  // 输入不是数组或空数组，返回空数组
  if (!Array.isArray(data) || data.length === 0) return [];

  // size <= 1 时，保持原数组为一个分片返回
  if (size <= 1) return [data];

  const result: any[] = [];

  for (let i = 0; i < data.length; i += size) {
    result.push(data.slice(i, i + size));
  }

  return result;
}

/** 返回 value 在目标范围内的值。 如果value不在范围内，则返回a范围最小 或 最大值。
 * @example
 * clamp(7, 1,100) // 7
 * clamp(120, 1,100) // 100
 */
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** 生成随机字符
 * Math.random 最快，但只能生成数字
 * nanoid 是最好的随机器，参见：nanoid 的 [readme](https://github.com/ai/nanoid/blob/main/README.zh-CN.md#基准值)
 * crypto.randomUUID 虽然比nanoid快速，但它的容量更小,只生成0-9 a-f, 且只能用在 https 安全的场景，否则报错。
 *
 * @param len 字符长度,建议不超过16
 * @param fast  是否使用快速模式, 快速模式只生成数字，默认值为false。
 *
 * @example
 * const id = 'dlg-' + random() // dlg-ad8DS-kE
 * const id = 'dlg-' + random(12, true) // dlg-123456789012
 */

export const random = (len = 8, fast = false) =>
  fast ? Math.random().toString().slice(2).slice(0, len) : nanoid(len);
