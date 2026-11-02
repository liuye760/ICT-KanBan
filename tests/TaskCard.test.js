import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TaskCard from '../src/components/TaskCard.vue'
import { formatDateTime } from '../src/utils/timeFormat'

function makeTask(overrides = {}) {
  return {
    id: 'task-1',
    title: '完成看板交互优化',
    description: '补充拖拽与星标细节',
    category: '研发',
    columnId: 'todo',
    starred: false,
    urgent: false,
    createdAt: Date.now(),
    ...overrides
  }
}

function mountCard(task = makeTask()) {
  return mount(TaskCard, { props: { task } })
}

describe('TaskCard 渲染', () => {
  it('渲染标题、描述、分类、时间与任务标识，并声明可拖拽', () => {
    const task = makeTask({ createdAt: 1700000000000 })
    const wrapper = mountCard(task)

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.find('.task-card__title').text()).toBe('完成看板交互优化')
    expect(wrapper.find('.task-card__desc').text()).toBe('补充拖拽与星标细节')
    expect(wrapper.find('.task-badge').text()).toBe('研发')
    expect(wrapper.find('.task-card__time').attributes('title')).toBe(
      formatDateTime(task.createdAt)
    )
    expect(wrapper.attributes('data-task-id')).toBe('task-1')
    expect(wrapper.attributes('draggable')).toBe('true')
  })

  it('描述与分类为空时不渲染对应节点', () => {
    const wrapper = mountCard(makeTask({ description: '', category: '' }))

    expect(wrapper.find('.task-card__desc').exists()).toBe(false)
    expect(wrapper.find('.task-badge').exists()).toBe(false)
    expect(wrapper.find('.task-card__title').text()).toBe('完成看板交互优化')
  })

  it('星标任务添加主题类、aria 状态并给出取消星标提示', () => {
    const wrapper = mountCard(makeTask({ starred: true }))
    const star = wrapper.find('.task-card__star')

    expect(wrapper.classes()).toContain('task-card--starred')
    expect(star.classes()).toContain('is-active')
    expect(star.attributes('aria-pressed')).toBe('true')
    expect(star.attributes('title')).toBe('取消星标')
  })

  it('紧急任务添加主题类、aria 状态并给出取消紧急提示', () => {
    const wrapper = mountCard(makeTask({ urgent: true }))
    const urgent = wrapper.find('.task-card__urgent')

    expect(wrapper.classes()).toContain('task-card--urgent')
    expect(urgent.classes()).toContain('is-active')
    expect(urgent.attributes('aria-pressed')).toBe('true')
    expect(urgent.attributes('title')).toBe('取消紧急')
  })

  it('非星标非紧急时按钮处于未激活状态', () => {
    const wrapper = mountCard()
    const star = wrapper.find('.task-card__star')
    const urgent = wrapper.find('.task-card__urgent')

    expect(wrapper.classes()).not.toContain('task-card--starred')
    expect(wrapper.classes()).not.toContain('task-card--urgent')
    expect(star.classes()).not.toContain('is-active')
    expect(urgent.classes()).not.toContain('is-active')
    expect(star.attributes('aria-pressed')).toBe('false')
    expect(urgent.attributes('aria-pressed')).toBe('false')
    expect(star.attributes('title')).toBe('标记星标')
    expect(urgent.attributes('title')).toBe('标记紧急')
  })
})

describe('TaskCard 事件', () => {
  it('点击星标按钮触发 toggle 事件并携带任务 id 与字段名', async () => {
    const wrapper = mountCard()
    await wrapper.find('.task-card__star').trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([['task-1', 'starred']])
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('点击紧急按钮触发 toggle 事件并携带任务 id 与字段名', async () => {
    const wrapper = mountCard()
    await wrapper.find('.task-card__urgent').trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([['task-1', 'urgent']])
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('点击删除按钮触发 remove 事件并携带任务 id', async () => {
    const wrapper = mountCard()
    await wrapper.find('.task-card__remove').trigger('click')

    expect(wrapper.emitted('remove')).toEqual([['task-1']])
    expect(wrapper.emitted('toggle')).toBeUndefined()
  })

  it('拖动开始时写入 text/plain 数据、设置移动模式并触发 drag-start', async () => {
    const wrapper = mountCard()
    const dataTransfer = {
      effectAllowed: '',
      setData: vi.fn()
    }

    await wrapper.trigger('dragstart', { dataTransfer })

    expect(dataTransfer.effectAllowed).toBe('move')
    expect(dataTransfer.setData).toHaveBeenCalledTimes(1)
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'task-1')
    expect(wrapper.emitted('drag-start')).toEqual([['task-1']])
    expect(wrapper.classes()).toContain('task-card--dragging')
  })

  it('拖动结束移除拖拽样式并触发 drag-end', async () => {
    const wrapper = mountCard()

    await wrapper.trigger('dragstart', {
      dataTransfer: { effectAllowed: '', setData: vi.fn() }
    })
    expect(wrapper.classes()).toContain('task-card--dragging')

    await wrapper.trigger('dragend')

    expect(wrapper.classes()).not.toContain('task-card--dragging')
    expect(wrapper.emitted('drag-end')).toHaveLength(1)
  })

  it('dataTransfer 缺失时拖动开始仍能触发事件且不抛异常', async () => {
    const wrapper = mountCard()

    await wrapper.trigger('dragstart')

    expect(wrapper.emitted('drag-start')).toEqual([['task-1']])
    expect(wrapper.classes()).toContain('task-card--dragging')
  })
})