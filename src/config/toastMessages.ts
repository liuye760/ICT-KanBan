export type ToastKind = 'add' | 'remove' | 'move' | 'star' | 'unstar' | 'urgent' | 'calm' | 'reset' | 'info'

export const toastMessages: Record<ToastKind, string[]> = {
  add: ['新任务已就位，开干吧！', '又一个目标被记下来了 ✍️', '计划 +1，焦虑 -1', '好记性不如烂笔头，靠谱！'],
  remove: ['已移除，轻装上阵 🍃', '放手也是一种效率', '这个包袱丢掉啦', '清单更清爽了'],
  move: ['状态已更新，继续推进 🚀', '流动起来才叫看板', '一切都在掌控之中', '节奏感不错嘛'],
  star: ['重点已标记 ⭐', '重要的事值得被看见', '这颗星，为你点亮', '优先级 up up'],
  unstar: ['已取消星标', '回归普通任务', '星光暂时收起'],
  urgent: ['紧急任务，注意节奏 🔥', '火已点亮，速战速决', '高优先级，冲！'],
  calm: ['已解除紧急状态 😌', '松一口气', '恢复从容节奏'],
  reset: ['看板已清空，重新出发 🌱', '归零，也是一种开始', '一切从头，轻装上阵'],
  info: ['已保存到本地', '操作成功', '收到 ✅', '稳稳的']
}

export function randomMessage(kind: ToastKind): string {
  const pool = toastMessages[kind] ?? toastMessages.info
  return pool[Math.floor(Math.random() * pool.length)]
}