export const STORAGE_KEY = 'task-kanban-state-v1'

const VALID_COLUMN_IDS = ['todo', 'doing', 'done']

export function defaultColumns() {
  return [
    { id: 'todo', title: '待办', color: '#6366f1' },
    { id: 'doing', title: '进行中', color: '#f59e0b' },
    { id: 'done', title: '已完成', color: '#10b981' }
  ]
}

export function defaultState() {
  return {
    columns: defaultColumns(),
    tasks: []
  }
}

export function createTaskId() {
  const random = Math.random().toString(36).slice(2, 10)
  return `task-${Date.now().toString(36)}-${random}`
}

function normalizeTask(task) {
  if (!task || typeof task !== 'object') return null
  if (typeof task.id !== 'string' || typeof task.title !== 'string') return null

  const columnId = VALID_COLUMN_IDS.includes(task.columnId) ? task.columnId : 'todo'

  return {
    id: task.id,
    title: task.title,
    description: typeof task.description === 'string' ? task.description : '',
    category: typeof task.category === 'string' ? task.category : '',
    columnId,
    starred: Boolean(task.starred),
    urgent: Boolean(task.urgent),
    createdAt: typeof task.createdAt === 'number' ? task.createdAt : Date.now()
  }
}

export function loadState(storage = globalThis.localStorage) {
  if (!storage) return defaultState()

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultState()
    if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.columns)) return defaultState()

    const seen = new Set()
    const tasks = []
    for (const item of parsed.tasks) {
      const task = normalizeTask(item)
      if (!task || seen.has(task.id)) continue
      seen.add(task.id)
      tasks.push(task)
    }

    const columns = parsed.columns
      .filter((column) => column && VALID_COLUMN_IDS.includes(column.id))
      .map((column) => ({
        id: column.id,
        title: typeof column.title === 'string' ? column.title : '',
        color: typeof column.color === 'string' ? column.color : '#6366f1'
      }))

    return {
      columns: columns.length === VALID_COLUMN_IDS.length ? columns : defaultColumns(),
      tasks
    }
  } catch (error) {
    return defaultState()
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  if (!storage) return false

  try {
    const payload = {
      columns: state?.columns ?? defaultColumns(),
      tasks: state?.tasks ?? []
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch (error) {
    return false
  }
}