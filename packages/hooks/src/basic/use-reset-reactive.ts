import { reactive } from 'vue'
/**
 * 克隆给定的值。如果值是null或不是对象类型，则直接返回该值。
 * 对于对象类型，通过JSON序列化和反序列化的方式进行克隆。
 * 注意：这种方法不适用于具有循环引用或无法序列化的对象。
 *
 * @param value 任意类型的值，将被克隆。
 * @returns 克隆后的值，如果输入是null或非对象类型，则返回原始值。
 */
function defaultClone(value: any) {
  // 检查值是否为null或非对象类型，如果是，则直接返回值
  if (value === null || typeof value !== 'object')
    return value
  // 对于对象类型，通过JSON序列化和反序列化的方式进行克隆
  return JSON.parse(JSON.stringify(value))
}
/**
 * 使用 useResetReactive 函数来创建一个可重置的响应式对象
 * 该函数接受一个对象和一个可选的克隆函数作为参数，返回一个包含响应式对象和重置方法的元组
 *
 * @param value {T} - 初始对象值，用于创建响应式对象
 * @param clone {Function} - 可选的克隆函数，用于深拷贝对象，默认为 defaultClone
 * @returns {readonly [T & Record<string, any>, () => void]} - 返回一个只读元组，包含响应式对象和重置方法
 */
export default function useResetReactive<T extends object>(value: T, clone = defaultClone) {
  // 创建一个响应式对象，它是一个具有响应式能力的深拷贝对象
  const state = reactive(clone(value)) as T & Record<string, any>
  /**
   * reset 函数用于将响应式对象重置为其初始状态
   * 它通过删除所有属性并重新赋值来实现
   */
  const reset = () => {
    // 删除响应式对象上的所有属性
    Object.keys(state).forEach(key => delete state[key])
    // 将初始值的深拷贝重新赋值给响应式对象
    Object.assign(state, clone(value))
  }

  // 返回包含响应式对象和重置方法的只读元组
  return [state, reset] as const
}
