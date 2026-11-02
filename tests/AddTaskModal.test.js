import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AddTaskModal from '../src/components/AddTaskModal.vue'
import { defaultColumns } from '../src/utils/storage.js'

const CATEGORIES = ['产品', '设计', '研发', '测试', '运营', '学习', '生活']

function mountModal(props = {}) {
  return mount(AddTaskModal, {
    props: {
      columns: defaultColumns(),
      existingCategories: CATEGORIES,
      defaultColumnId: 'todo',
      ...props
    },
    attachTo: document.body
  })
}

function submitForm(wrapper) {
  return wrapper.find('form').trigger('submit')
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('AddTaskModal 渲染与列选择', () => {
  it('渲染对话框标题与所有列选项', () => {
    const wrapper = mountModal()
    const options = wrapper.findAll('[data-field="column"] option')

    expect(wrapper.find('[data-testid="add-task-modal"]').attributes('role')).toBe('dialog')
    expect(wrapper.find('#add-task-heading').text()).toBe('新增任务')
    expect(options).toHaveLength(3)
    expect(options.map((option) => option.text())).toEqual(['待办', '进行中', '已完成'])
    expect(options.map((option) => option.attributes('value'))).toEqual(['todo', 'doing', 'done'])
  })

  it('defaultColumnId 不存在时自动回退到第一列', () => {
    const wrapper = mountModal({ defaultColumnId: 'archived' })

    expect(wrapper.find('[data-field="column"]').element.value).toBe('todo')
  })

  it('挂载后自动聚焦标题输入框', () => {
    const wrapper = mountModal()

    expect(document.activeElement).toBe(wrapper.find('[data-field="title"]').element)
  })

  it('已有分类渲染为 datalist 选项', () => {
    const wrapper = mountModal()
    const options = wrapper.findAll('#category-options option')

    expect(options).toHaveLength(CATEGORIES.length)
    expect(options.map((option) => option.attributes('value'))).toEqual(CATEGORIES)
  })
})

describe('AddTaskModal 校验与提交', () => {
  it('空标题不提交并显示错误提示', async () => {
    const wrapper = mountModal()

    await submitForm(wrapper)

    const error = wrapper.find('.form-error')
    expect(error.exists()).toBe(true)
    expect(error.text()).toBe('请先填写任务标题')
    expect(error.attributes('role')).toBe('alert')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('仅空白字符的标题同样视为空标题', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-field="title"]').setValue('   ')

    await submitForm(wrapper)

    expect(wrapper.find('.form-error').text()).toBe('请先填写任务标题')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('用户重新输入后清除错误提示', async () => {
    const wrapper = mountModal()
    await submitForm(wrapper)
    expect(wrapper.find('.form-error').exists()).toBe(true)

    await wrapper.find('[data-field="title"]').setValue('修复登录缺陷')

    expect(wrapper.find('.form-error').exists()).toBe(false)
  })

  it('提交时携带完整且已去除首尾空格的数据', async () => {
    const wrapper = mountModal()

    await wrapper.find('[data-field="title"]').setValue('  修复登录缺陷  ')
    await wrapper.find('[data-field="description"]').setValue('  覆盖空态与错误态  ')
    await wrapper.find('[data-field="category"]').setValue('  研发  ')
    await wrapper.find('[data-field="column"]').setValue('doing')
    await wrapper.find('[data-field="starred"]').trigger('click')
    await wrapper.find('[data-field="urgent"]').trigger('click')

    await submitForm(wrapper)

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      title: '修复登录缺陷',
      description: '覆盖空态与错误态',
      category: '研发',
      columnId: 'doing',
      starred: true,
      urgent: true
    })
    expect(wrapper.find('.form-error').exists()).toBe(false)
  })

  it('星标与紧急按钮可切换 aria 状态', async () => {
    const wrapper = mountModal()
    const starred = wrapper.find('[data-field="starred"]')
    const urgent = wrapper.find('[data-field="urgent"]')

    expect(starred.attributes('aria-pressed')).toBe('false')
    expect(urgent.attributes('aria-pressed')).toBe('false')

    await starred.trigger('click')
    await urgent.trigger('click')
    expect(starred.attributes('aria-pressed')).toBe('true')
    expect(urgent.attributes('aria-pressed')).toBe('true')

    await starred.trigger('click')
    await urgent.trigger('click')
    expect(starred.attributes('aria-pressed')).toBe('false')
    expect(urgent.attributes('aria-pressed')).toBe('false')
  })

  it('取消按钮触发 close 且不提交数据', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-field="title"]').setValue('不会提交的任务')

    await wrapper.find('[data-action="cancel"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('关闭按钮与遮罩点击均可触发 close', async () => {
    const wrapper = mountModal()

    await wrapper.find('.modal__close').trigger('click')
    await wrapper.find('.modal-backdrop').trigger('mousedown')

    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('按下 Escape 触发 close，卸载后不再响应键盘事件', async () => {
    const wrapper = mountModal()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    const closeEvents = wrapper.emitted('close')
    expect(closeEvents).toHaveLength(1)

    wrapper.unmount()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(closeEvents).toHaveLength(1)
  })

  it('非 Escape 按键不会触发 close', async () => {
    const wrapper = mountModal()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(wrapper.emitted('close')).toBeUndefined()
  })
})

describe('AddTaskModal 分类建议', () => {
  it('未输入时最多展示 6 个已有分类 chips', () => {
    const wrapper = mountModal()
    const chips = wrapper.findAll('.category-chip')

    expect(chips).toHaveLength(6)
    expect(chips.map((chip) => chip.text())).toEqual(CATEGORIES.slice(0, 6))
  })

  it('无已有分类时不渲染 chips', () => {
    const wrapper = mountModal({ existingCategories: [] })

    expect(wrapper.findAll('.category-chip')).toHaveLength(0)
  })

  it('输入关键字后仅保留匹配分类，并排除与输入完全相同的分类', async () => {
    const wrapper = mountModal()

    await wrapper.find('[data-field="category"]').setValue('设')
    expect(wrapper.findAll('.category-chip').map((chip) => chip.text())).toEqual(['设计'])

    await wrapper.find('[data-field="category"]').setValue('测试')
    expect(wrapper.findAll('.category-chip')).toHaveLength(0)
  })

  it('点击 chip 将分类写入输入框', async () => {
    const wrapper = mountModal()
    await wrapper.find('[data-field="category"]').setValue('研')

    const chips = wrapper.findAll('.category-chip')
    expect(chips.map((chip) => chip.text())).toEqual(['研发'])

    await chips[0].trigger('click')

    expect(wrapper.find('[data-field="category"]').element.value).toBe('研发')
    expect(wrapper.findAll('.category-chip')).toHaveLength(0)
  })
})