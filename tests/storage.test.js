import { describe, expect, it, vi } from 'vitest'
import {
  STORAGE_KEY,
  createTaskId,
  defaultColumns,
  defaultState,
  loadState,
  saveState
} from '../src/utils/storage.js'

function createMemoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed))
  return {
    getItem: vi.fn((key) => (data.has(key) ? data.get(key) : null)),
    setItem: vi.fn((key, value) => {
      data.set(key, String(value))
    }),
    removeItem: vi.fn((key) => {
      data.delete(key)
    }),
    read: (key) => data.get(key)
  }
}

function storageWithRaw(raw) {
  return createMemoryStorage({ [STORAGE_KEY]: raw })
}

const validTask = {
  id: 'task-a',
  title: '完成看板交互优化',
  description: '覆盖拖拽与星标',
  category: '研发',
  columnId: 'doing',
  starred: true,
  urgent: false,
  createdAt: 1700000000000
}

describe('defaultColumns / defaultState', () => {
  it('返回 todo/doing/done 三列及对应的标题与颜色', () => {
    const columns = defaultColumns()

    expect(columns).toHaveLength(3)
    expect(columns.map((column) => column.id)).toEqual(['todo', 'doing', 'done'])
    expect(columns.map((column) => column.title)).toEqual(['待办', '进行中', '已完成'])
    expect(columns.map((column) => column.color)).toEqual(['#6366f1', '#f59e0b', '#10b981'])
    expect(columns.every((column) => /^#[0-9a-f]{6}$/i.test(column.color))).toBe(true)
  })

  it('每次调用都返回全新的对象，修改结果不会污染下一次默认值', () => {
    const first = defaultState()
    const second = defaultState()

    expect(first).toEqual({ columns: defaultColumns(), tasks: [] })
    expect(first.columns).not.toBe(second.columns)
    expect(first.tasks).not.toBe(second.tasks)

    first.columns[0].title = '被篡改'
    first.tasks.push({ id: 'leak' })

    expect(defaultColumns()[0].title).toBe('待办')
    expect(second.columns[0].title).toBe('待办')
    expect(second.tasks).toEqual([])
  })
})

describe('createTaskId', () => {
  it('生成 task- 前缀且由时间片与随机片组成的 id', () => {
    const id = createTaskId()

    expect(id).toMatch(/^task-[0-9a-z]+-[0-9a-z]{1,8}$/)
    expect(id.startsWith('task-')).toBe(true)
  })

  it('连续生成 500 个 id 互不重复', () => {
    const ids = new Set()
    for (let index = 0; index < 500; index += 1) {
      ids.add(createTaskId())
    }

    expect(ids.size).toBe(500)
  })
})

describe('loadState', () => {
  it('storage 不可用时返回默认状态', () => {
    expect(loadState(null)).toEqual(defaultState())
    expect(loadState(undefined)).toEqual({ columns: defaultColumns(), tasks: [] })
  })

  it('尚未写入数据时返回默认状态', () => {
    const storage = createMemoryStorage()

    expect(loadState(storage)).toEqual(defaultState())
    expect(storage.getItem).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('JSON 格式损坏时降级为默认状态且不抛异常', () => {
    const storage = storageWithRaw('{"columns": [{"id": "todo"')

    expect(() => loadState(storage)).not.toThrow()
    expect(loadState(storage)).toEqual(defaultState())
  })

  it('JSON 解析结果不是对象时降级为默认状态', () => {
    expect(loadState(storageWithRaw('12345'))).toEqual(defaultState())
    expect(loadState(storageWithRaw('null'))).toEqual(defaultState())
    expect(loadState(storageWithRaw('"text"'))).toEqual(defaultState())
  })

  it('tasks 或 columns 不是数组时降级为默认状态', () => {
    expect(loadState(storageWithRaw(JSON.stringify({ tasks: {}, columns: [] })))).toEqual(
      defaultState()
    )
    expect(loadState(storageWithRaw(JSON.stringify({ tasks: [], columns: 'todo' })))).toEqual(
      defaultState()
    )
  })

  it('storage.getItem 抛出异常时降级为默认状态', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('SecurityError')
      })
    }

    expect(() => loadState(storage)).not.toThrow()
    expect(loadState(storage)).toEqual(defaultState())
  })

  it('正常状态可以完整往返保存与读取', () => {
    const storage = createMemoryStorage()
    const state = { columns: defaultColumns(), tasks: [validTask] }

    expect(saveState(state, storage)).toBe(true)
    expect(loadState(storage)).toEqual(state)
  })

  it('过滤非法任务并补全缺失字段的默认值', () => {
    const raw = {
      columns: defaultColumns(),
      tasks: [
        null,
        'not-an-object',
        { title: '缺少 id' },
        { id: 'missing-title' },
        {
          id: 'task-loose',
          title: '字段类型异常',
          description: 123,
          category: null,
          columnId: 'archived',
          starred: 'yes',
          urgent: 0,
          createdAt: 'yesterday'
        }
      ]
    }

    const state = loadState(storageWithRaw(JSON.stringify(raw)))

    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0]).toMatchObject({
      id: 'task-loose',
      title: '字段类型异常',
      description: '',
      category: '',
      columnId: 'todo',
      starred: true,
      urgent: false
    })
    expect(typeof state.tasks[0].createdAt).toBe('number')
    expect(Number.isFinite(state.tasks[0].createdAt)).toBe(true)
  })

  it('重复 id 的任务只保留第一次出现的记录', () => {
    const raw = {
      columns: defaultColumns(),
      tasks: [
        { ...validTask, id: 'duplicated', title: '第一次' },
        { ...validTask, id: 'duplicated', title: '第二次' }
      ]
    }

    const state = loadState(storageWithRaw(JSON.stringify(raw)))

    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0].title).toBe('第一次')
  })

  it('过滤非法列 id，剩余列数不足时回退为默认三列', () => {
    const state = loadState(
      storageWithRaw(
        JSON.stringify({
          tasks: [],
          columns: [
            { id: 'todo', title: '待办', color: '#111111' },
            { id: 'unknown', title: '未知', color: '#222222' }
          ]
        })
      )
    )

    expect(state.columns).toEqual(defaultColumns())
  })

  it('合法列保留自定义标题与颜色，非法字段回退默认值', () => {
    const state = loadState(
      storageWithRaw(
        JSON.stringify({
          tasks: [],
          columns: [
            { id: 'todo', title: 42, color: 7 },
            { id: 'doing', title: '处理中', color: '#abcdef' },
            { id: 'done', title: '收工', color: '#123456' }
          ]
        })
      )
    )

    expect(state.columns).toEqual([
      { id: 'todo', title: '', color: '#6366f1' },
      { id: 'doing', title: '处理中', color: '#abcdef' },
      { id: 'done', title: '收工', color: '#123456' }
    ])
  })
})

describe('saveState', () => {
  it('使用固定 key 序列化 columns 与 tasks，并返回 true', () => {
    const storage = createMemoryStorage()
    const state = { columns: defaultColumns(), tasks: [validTask] }

    expect(saveState(state, storage)).toBe(true)

    expect(storage.setItem).toHaveBeenCalledTimes(1)
    const [key, value] = storage.setItem.mock.calls[0]
    expect(key).toBe(STORAGE_KEY)
    expect(JSON.parse(value)).toEqual(state)
  })

  it('state 为空时写入默认列与空任务列表', () => {
    const storage = createMemoryStorage()

    expect(saveState(undefined, storage)).toBe(true)
    expect(JSON.parse(storage.read(STORAGE_KEY))).toEqual({
      columns: defaultColumns(),
      tasks: []
    })

    expect(saveState({}, storage)).toBe(true)
    expect(JSON.parse(storage.read(STORAGE_KEY))).toEqual({
      columns: defaultColumns(),
      tasks: []
    })
  })

  it('写入抛出配额异常时返回 false 且不向上抛出', () => {
    const storage = {
      setItem: vi.fn(() => {
        throw new Error('QuotaExceededError')
      })
    }

    expect(() => saveState({ columns: [], tasks: [] }, storage)).not.toThrow()
    expect(saveState({ columns: [], tasks: [] }, storage)).toBe(false)
  })

  it('storage 不可用时返回 false', () => {
    expect(saveState({ columns: [], tasks: [] }, null)).toBe(false)
  })
})