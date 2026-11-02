import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import KanbanColumn from '../src/components/KanbanColumn.vue'
import TaskCard from '../src/components/TaskCard.vue'
import EmptyState from '../src/components/EmptyState.vue'

function makeColumn(overrides = {}) {
  return { id: 'todo', title: '待办', color: '#6366f1', ...overrides }
}

function makeTask(overrides = {}) {
  return {
    id: 'task-1',
    title: '完成看板交互优化',
    description: '',
    category: '',
    columnId: 'todo',
    starred: false,
    urgent: false,
    createdAt: Date.now(),
    ...overrides
  }
}

function mountColumn({ column = makeColumn(), taskList = [] } = {}) {
  return mount(KanbanColumn, { props: { column, taskList } })
}

describe('KanbanColumn 渲染', () => {
  it('渲染列标题、色点样式与任务计数', () => {
    const wrapper = mountColumn({
      taskList: [makeTask(), makeTask({ id: 'task-2', title: '第二个任务' })]
    })

    expect(wrapper.attributes('data-column-id')).toBe('todo')
    expect(wrapper.find('.kanban-column__title').text()).toBe('待办')
    expect(wrapper.find('.kanban-column__count').text()).toBe('2'
    )
    expect(wrapper.find('.kanban-column__header').attributes('style')).toContain(
      '--column-color: #6366f1'
    )
  })

  it('任务列表按顺序渲染 TaskCard 组件', () => {
    const tasks = [
      makeTask({ id: 'task-1', title: '第一项' }),
      makeTask({ id: 'task-2', title: '第二项' })
    ]
    const wrapper = mountColumn({ taskList: tasks })
    const cards = wrapper.findAllComponents(TaskCard)

    expect(cards).toHaveLength(2)
    expect(cards.map((card) => card.props('task').id)).toEqual(['task-1', 'task-2'])
    expect(cards.map((card) => card.text())).toEqual([
      expect.stringContaining('第一项'),
      expect.stringContaining('第二项')
    ])
    expect(wrapper.findComponent(EmptyState).exists()).toBe(false)
  })

  it.each([
    ['todo', '暂无待办任务', '点击右上角 + 新建一个任务', '🗒️'],
    ['doing', '没有进行中的任务', '把待办卡片拖到这里开始处理', '⏳'],
    ['done', '还没有完成的任务', '完成任务后拖到这里，会有惊喜哦', '🏁'],
    ['archived', '暂无任务', '拖拽任务卡片到此处试试', '📭']
  ])('空列 %s 展示对应空状态文案', (id, title, hint, icon) => {
    const wrapper = mountColumn({ column: makeColumn({ id, title: '列标题' }) })
    const empty = wrapper.findComponent(EmptyState)

    expect(empty.exists()).toBe(true)
    expect(empty.props()).toMatchObject({ title, hint, icon, actionText: '新增任务' })
    expect(wrapper.findAllComponents(TaskCard)).toHaveLength(0)
  })
})

describe('KanbanColumn 拖放', () => {
  it('dragover 时阻止默认行为、设置 dropEffect 并进入悬停高亮', async () => {
    const wrapper = mountColumn()
    const dataTransfer = { dropEffect: 'none' }

    await wrapper.trigger('dragover', { dataTransfer })

    expect(dataTransfer.dropEffect).toBe('move')
    expect(wrapper.classes()).toContain('kanban-column--over')
  })

  it('dragenter 时进入悬停高亮', async () => {
    const wrapper = mountColumn()

    await wrapper.trigger('dragenter')

    expect(wrapper.classes()).toContain('kanban-column--over')
  })

  it('dragleave 到列内部元素时保持高亮，离开列时取消高亮', async () => {
    const wrapper = mountColumn()
    await wrapper.trigger('dragenter')
    expect(wrapper.classes()).toContain('kanban-column--over')

    await wrapper.trigger('dragleave', {
      relatedTarget: wrapper.find('.kanban-column__title').element
    })
    expect(wrapper.classes()).toContain('kanban-column--over')

    await wrapper.trigger('dragleave', { relatedTarget: document.body })
    expect(wrapper.classes()).not.toContain('kanban-column--over')
  })

  it('drop 时读取 text/plain 数据并触发 move(taskId, columnId)', async () => {
    const wrapper = mountColumn({ column: makeColumn({ id: 'doing', title: '进行中' }) })
    const dataTransfer = { getData: vi.fn(() => 'task-9') }

    await wrapper.trigger('dragover', { dataTransfer })
    await wrapper.trigger('drop', { dataTransfer })

    expect(dataTransfer.getData).toHaveBeenCalledWith('text/plain')
    expect(wrapper.emitted('move')).toEqual([['task-9', 'doing']])
    expect(wrapper.classes()).not.toContain('kanban-column--over')
  })

  it('dataTransfer 无数据时回退到内部记录的拖拽任务 id', async () => {
    const wrapper = mountColumn({ taskList: [makeTask({ id: 'task-fallback' })] })

    wrapper.findComponent(TaskCard).vm.$emit('drag-start', 'task-fallback')
    await wrapper.trigger('drop')

    expect(wrapper.emitted('move')).toEqual([['task-fallback', 'todo']])
  })

  it('既无 dataTransfer 数据也无内部记录时不触发 move', async () => {
    const wrapper = mountColumn()

    await wrapper.trigger('drop')

    expect(wrapper.emitted('move')).toBeUndefined()
  })

  it('drag-end 清空内部拖拽状态，之后 drop 不再触发 move', async () => {
    const wrapper = mountColumn({ taskList: [makeTask({ id: 'task-clear' })] })

    wrapper.findComponent(TaskCard).vm.$emit('drag-start', 'task-clear')
    wrapper.findComponent(TaskCard).vm.$emit('drag-end')
    await wrapper.trigger('drop')

    expect(wrapper.emitted('move')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('kanban-column--over')
  })
})

describe('KanbanColumn 事件转发', () => {
  it('点击加号按钮触发 add 事件并携带列 id', async () => {
    const wrapper = mountColumn({ column: makeColumn({ id: 'done', title: '已完成' }) })

    await wrapper.find('.kanban-column__add').trigger('click')

    expect(wrapper.emitted('add')).toEqual([['done']])
  })

  it('点击空状态的新增任务按钮触发 add 事件', async () => {
    const wrapper = mountColumn({ column: makeColumn({ id: 'doing', title: '进行中' }) })

    await wrapper.findComponent(EmptyState).vm.$emit('action')

    expect(wrapper.emitted('add')).toEqual([['doing']])
  })

  it('转发子卡片的 toggle 与 remove 事件', async () => {
    const wrapper = mountColumn({ taskList: [makeTask({ id: 'task-x' })] })

    await wrapper.find('.task-card__star').trigger('click')
    await wrapper.find('.task-card__remove').trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([['task-x', 'starred']])
    expect(wrapper.emitted('remove')).toEqual([['task-x']])
  })

  it('转发子卡片的 drag-start 后可在本列 drop 中完成移动', async () => {
    const wrapper = mountColumn({
      column: makeColumn({ id: 'done', title: '已完成' }),
      taskList: [makeTask({ id: 'task-y' })]
    })

    await wrapper.find('.task-card').trigger('dragstart', {
      dataTransfer: { effectAllowed: '', setData: vi.fn() }
    })
    await wrapper.trigger('drop')

    expect(wrapper.emitted('move')).toEqual([['task-y', 'done']])
  })
})