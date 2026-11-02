<script setup>
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  taskList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['move', 'toggle', 'remove', 'add'])

const isOver = ref(false)
const draggingTaskId = ref(null)

const EMPTY_TEXT = {
  todo: { icon: '🗒️', title: '暂无待办任务', hint: '点击右上角 + 新建一个任务' },
  doing: { icon: '⏳', title: '没有进行中的任务', hint: '把待办卡片拖到这里开始处理' },
  done: { icon: '🏁', title: '还没有完成的任务', hint: '完成任务后拖到这里，会有惊喜哦' }
}

function onDragOver(event) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  isOver.value = true
}

function onDragLeave(event) {
  if (event.currentTarget?.contains(event.relatedTarget)) return
  isOver.value = false
}

function onDragStart(taskId) {
  draggingTaskId.value = taskId
  isOver.value = false
}

function onDrop(event) {
  event.preventDefault()
  isOver.value = false

  const taskId = event.dataTransfer?.getData('text/plain') || draggingTaskId.value
  draggingTaskId.value = null

  if (taskId) emit('move', taskId, props.column.id)
}

function onDragEnd() {
  draggingTaskId.value = null
  isOver.value = false
}
</script>

<template>
  <section
    class="kanban-column"
    :class="{ 'kanban-column--over': isOver }"
    :data-column-id="column.id"
    @dragover="onDragOver"
    @dragenter.prevent="isOver = true"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="kanban-column__header" :style="{ '--column-color': column.color }">
      <span class="kanban-column__dot" aria-hidden="true"></span>
      <h2 class="kanban-column__title">{{ column.title }}</h2>
      <span class="kanban-column__count">{{ taskList.length }}</span>
      <button
        type="button"
        class="icon-btn kanban-column__add"
        title="在此列新增任务"
        @click="emit('add', column.id)"
      >
        +
      </button>
    </header>

    <div class="kanban-column__body">
      <TransitionGroup name="card" tag="ul" class="kanban-column__list">
        <li v-for="task in taskList" :key="task.id" class="kanban-column__item">
          <TaskCard
            :task="task"
            @toggle="(id, flag) => emit('toggle', id, flag)"
            @remove="(id) => emit('remove', id)"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
          />
        </li>
      </TransitionGroup>

      <EmptyState
        v-if="taskList.length === 0"
        :icon="EMPTY_TEXT[column.id]?.icon ?? '📭'"
        :title="EMPTY_TEXT[column.id]?.title ?? '暂无任务'"
        :hint="EMPTY_TEXT[column.id]?.hint ?? '拖拽任务卡片到此处试试'"
        action-text="新增任务"
        action-icon="+"
        @action="emit('add', column.id)"
      />
    </div>
  </section>
</template>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 320px;
  padding: var(--space-3);
  border: 1.5px solid transparent;
  border-radius: var(--radius-lg);
  background: var(--color-column-bg);
  backdrop-filter: blur(10px);
  transition: border-color var(--transition), background var(--transition),
    box-shadow var(--transition), transform var(--transition);
}

.kanban-column--over {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
  transform: translateY(-2px);
}

.kanban-column__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
}

.kanban-column__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--column-color, var(--color-primary));
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--column-color, var(--color-primary)) 22%, transparent);
}

.kanban-column__title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.kanban-column__count {
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 11.5px;
  font-weight: 600;
}

.kanban-column__add {
  margin-left: auto;
  font-size: 18px;
  line-height: 1;
}

.kanban-column__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
}

.kanban-column__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.kanban-column__item {
  display: block;
}

.kanban-column__list:empty {
  display: none;
}

.card-enter-active,
.card-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.card-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.card-move {
  transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>