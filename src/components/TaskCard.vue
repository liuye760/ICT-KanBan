<script setup>
import { computed } from 'vue'
import { formatRelativeTime, formatDateTime } from '../utils/timeFormat'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle', 'remove', 'drag-start', 'drag-end'])

const relativeTime = computed(() => formatRelativeTime(props.task.createdAt))
const absoluteTime = computed(() => formatDateTime(props.task.createdAt))

function onDragStart(event) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.task.id)
  }
  event.currentTarget?.classList.add('task-card--dragging')
  emit('drag-start', props.task.id)
}

function onDragEnd(event) {
  event.currentTarget?.classList.remove('task-card--dragging')
  emit('drag-end')
}
</script>

<template>
  <article
    class="task-card"
    :class="{
      'task-card--starred': task.starred,
      'task-card--urgent': task.urgent
    }"
    :data-task-id="task.id"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <header class="task-card__head">
      <h3 class="task-card__title">{{ task.title }}</h3>
      <div class="task-card__actions">
        <button
          type="button"
          class="icon-btn task-card__star"
          :class="{ 'is-active': task.starred }"
          :aria-pressed="String(Boolean(task.starred))"
          :title="task.starred ? '取消星标' : '标记星标'"
          @click.stop="emit('toggle', task.id, 'starred')"
        >
          ★
        </button>
        <button
          type="button"
          class="icon-btn task-card__urgent"
          :class="{ 'is-active': task.urgent }"
          :aria-pressed="String(Boolean(task.urgent))"
          :title="task.urgent ? '取消紧急' : '标记紧急'"
          @click.stop="emit('toggle', task.id, 'urgent')"
        >
          🔥
        </button>
        <button
          type="button"
          class="icon-btn task-card__remove"
          title="删除任务"
          @click.stop="emit('remove', task.id)"
        >
          ✕
        </button>
      </div>
    </header>

    <p v-if="task.description" class="task-card__desc">{{ task.description }}</p>

    <footer class="task-card__foot">
      <span v-if="task.category" class="task-badge">{{ task.category }}</span>
      <time class="task-card__time" :title="absoluteTime">{{ relativeTime }}</time>
    </footer>
  </article>
</template>

<style scoped>
.task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: grab;
  transition: transform var(--transition), box-shadow var(--transition), opacity var(--transition),
    border-color var(--transition);
  animation: float-up 260ms ease both;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.task-card:active {
  cursor: grabbing;
}

.task-card--dragging {
  opacity: 0.45;
  transform: rotate(1.5deg) scale(0.98);
}

.task-card--urgent {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 1px var(--color-danger), var(--shadow-md);
}

.task-card--starred {
  background: linear-gradient(180deg, var(--color-primary-soft), var(--color-surface) 60%);
}

.task-card__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.task-card__title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  word-break: break-word;
}

.task-card__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.task-card__star,
.task-card__urgent,
.task-card__remove {
  font-size: 13px;
  line-height: 1;
}

.task-card__star {
  color: var(--color-text-muted);
}

.task-card__star.is-active {
  color: var(--color-star);
}

.task-card__urgent {
  filter: grayscale(1);
  opacity: 0.6;
}

.task-card__urgent.is-active {
  filter: none;
  opacity: 1;
}

.task-card__remove:hover {
  color: var(--color-danger);
  background: var(--color-primary-soft);
}

.task-card__desc {
  font-size: 12.5px;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
}

.task-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.task-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 11.5px;
  font-weight: 600;
}

.task-card__time {
  font-size: 11.5px;
  color: var(--color-text-muted);
  margin-left: auto;
}
</style>