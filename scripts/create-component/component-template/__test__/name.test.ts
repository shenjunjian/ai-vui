import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import $capName$Vue from '../$rawName$.vue'

describe('$capName$的单元测试', () => {
  it('最简的$cnName$', () => {
    const wrapper = mount($capName$Vue, {})
    expect(wrapper.text()).toContain('$capName$')
  })
})
