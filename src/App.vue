<script setup>
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import KanbanColumn from './components/KanbanColumn.vue'
import AddTaskModal from './components/AddTaskModal.vue'
import FunToast from './components/FunToast.vue'
import Celebration from './components/Celebration.vue'
import { useKanban } from './composables/useKanban'
import { useToast } from './composables/useToast'

const {
  columns,
  tasks,
  tasksByColumn,
  categories,
  addTask,
  removeTask,
  toggleTask,
  moveTask,
  resetBoard
} = useKanban()

const { showRandom } = useToast()

const modalOpen = ref(false)
const modalColumnId = ref('todo')
const celebrationVisible = ref(false)
const celebrationEffect = ref('confetti')

const celebrationEffects = ['confetti', 'stars', 'hearts']

function openModal(columnId = 'todo') {
  modalColumnId.value = columnId
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function handleSubmit(payload) {
  const task = addTask(payload)
  if (!task) return
  modalOpen.value = false
  showRandom('add')
}

function handleRemove(taskId) {
  if (removeTask(taskId)) showRandom('remove')
}

function handleToggle(taskId, field) {
  const value = toggleTask(taskId, field)
  if (value === null) return

  if (field === 'starred') {
    showRandom(value ? 'star' : 'unstar')
    return
  }
  showRandom(value ? 'urgent' : 'calm')
}

function handleMove(taskId, columnId) {
  const previous = tasks.value.find((task) => task.id === taskId)?.columnId
  const target = moveTask(taskId, columnId)
  if (!target) return

  showRandom('move')

  if (target === 'done' && previous !== 'done') {
    celebrationEffect.value =
      celebrationEffects[Math.floor(Math.random() * celebrationEffects.length)]
    celebrationVisible.value = true
  }
}

function handleReset() {
  resetBoard()
  showRandom('reset')
}

function onCelebrationComplete() {
  celebrationVisible.value = false
}
</script>

<template>
  <div class="app">
    <div class="app__backdrop" aria-hidden="true">
      <span class="app__blob app__blob--one"></span>
      <span class="app__blob app__blob--two"></span>
    </div>

    <div class="app__inner">
      <NavBar :tasks="tasks" @add-task="openModal('todo')" @reset="handleReset" />

      <main class="board" aria-label="任务看板">
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :column="column"
          :task-list="tasksByColumn[column.id]"
          @move="handleMove"
          @toggle="handleToggle"
          @remove="handleRemove"
          @add="openModal"
        />
      </main>

      <footer class="app__footer">
        <span>数据自动保存至浏览器本地存储</span>
        <span class="app__footer-dot" aria-hidden="true">·</span>
        <span>拖拽卡片即可流转状态</span>
      </footer>
    </div>

    <AddTaskModal
      v-if="modalOpen"
      :columns="columns"
      :existing-categories="categories"
      :default-column-id="modalColumnId"
      @submit="handleSubmit"
      @close="closeModal"
    />

    <FunToast />
    <Celebration
      :visible="celebrationVisible"
      :effect="celebrationEffect"
      :duration="1800"
      @complete="onCelebrationComplete"
    />
  </div>
</template>

<style scoped>
.app {
  position: relative;
  min-height: 100%;
  overflow-x: hidden;
}

.app__backdrop {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.app__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.app__blob--one {
  width: 380px;
  height: 380px;
  top: -120px;
  left: -80px;
  background: var(--color-primary);
}

.app__blob--two {
  width: 320px;
  height: 320px;
  right: -60px;
  bottom: 8%;
  background: var(--color-accent);
  opacity: 0.24;
}

.app__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 1240px;
  margin: 0 auto;
  padding: var(--space-5) var(--space-5) var(--space-6);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  align-items: start;
}

.app__footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  font-size: 11.5px;
  color: var(--color-text-muted);
}

.app__footer-dot {
  opacity: 0.6;
}

@media (max-width: 960px) {
  .board {
    grid-template-columns: 1fr;
  }

  .app__inner {
    padding: var(--space-4);
  }
}
</style>