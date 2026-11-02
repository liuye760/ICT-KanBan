import { computed, ref, watch } from 'vue'
import {
  createTaskId,
  defaultColumns,
  loadState,
  saveState
} from '../utils/storage.js'

const COLUMN_IDS = ['todo', 'doing', 'done']

export function useKanban() {
  const initial = loadState()
  const columns = ref(initial.columns)
  const tasks = ref(initial.tasks)
  const lastMovedTaskId = ref(null)

  watch(
    [columns, tasks],
    ([nextColumns, nextTasks]) => {
      saveState({ columns: nextColumns, tasks: nextTasks })
    },
    { deep: true }
  )

  const tasksByColumn = computed(() => {
    const grouped = { todo: [], doing: [], done: [] }
    for (const task of tasks.value) {
      const bucket = grouped[task.columnId] ?? grouped.todo
      bucket.push(task)
    }
    return grouped
  })

  const total = computed(() => tasks.value.length)
  const doneCount = computed(() => tasksByColumn.value.done.length)
  const doingCount = computed(() => tasksByColumn.value.doing.length)
  const todoCount = computed(() => tasksByColumn.value.todo.length)
  const progress = computed(() =>
    total.value === 0 ? 0 : Math.round((doneCount.value / total.value) * 100)
  )
  const categories = computed(() => {
    const set = new Set()
    for (const task of tasks.value) {
      if (task.category) set.add(task.category)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  })

  function normalizeColumnId(columnId) {
    return COLUMN_IDS.includes(columnId) ? columnId : 'todo'
  }

  function addTask(payload) {
    const title = typeof payload?.title === 'string' ? payload.title.trim() : ''
    if (!title) return null

    const task = {
      id: createTaskId(),
      title,
      description: typeof payload.description === 'string' ? payload.description.trim() : '',
      category: typeof payload.category === 'string' ? payload.category.trim() : '',
      columnId: normalizeColumnId(payload.columnId),
      starred: Boolean(payload.starred),
      urgent: Boolean(payload.urgent),
      createdAt: Date.now()
    }

    tasks.value.push(task)
    return task
  }

  function removeTask(taskId) {
    const index = tasks.value.findIndex((task) => task.id === taskId)
    if (index === -1) return false
    tasks.value.splice(index, 1)
    return true
  }

  function toggleTask(taskId, field) {
    if (field !== 'starred' && field !== 'urgent') return null
    const task = tasks.value.find((item) => item.id === taskId)
    if (!task) return null
    task[field] = !task[field]
    return task[field]
  }

  function moveTask(taskId, columnId) {
    const task = tasks.value.find((item) => item.id === taskId)
    if (!task) return false
    const target = normalizeColumnId(columnId)
    if (task.columnId === target) return false
    task.columnId = target
    lastMovedTaskId.value = taskId
    return target
  }

  function updateTask(taskId, patch) {
    const task = tasks.value.find((item) => item.id === taskId)
    if (!task) return null
    if (typeof patch.title === 'string' && patch.title.trim()) task.title = patch.title.trim()
    if (typeof patch.description === 'string') task.description = patch.description.trim()
    if (typeof patch.category === 'string') task.category = patch.category.trim()
    if (patch.columnId) task.columnId = normalizeColumnId(patch.columnId)
    return task
  }

  function resetBoard() {
    tasks.value = []
    columns.value = defaultColumns()
    lastMovedTaskId.value = null
  }

  return {
    columns,
    tasks,
    tasksByColumn,
    total,
    todoCount,
    doingCount,
    doneCount,
    progress,
    categories,
    lastMovedTaskId,
    addTask,
    removeTask,
    toggleTask,
    moveTask,
    updateTask,
    resetBoard
  }
}