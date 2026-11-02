<script setup>
import { computed, ref } from 'vue'
import ThemeSelector from './ThemeSelector.vue'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-task', 'reset'])

const confirmingReset = ref(false)

const total = computed(() => props.tasks.length)
const doneCount = computed(() => props.tasks.filter((task) => task.columnId === 'done').length)
const doingCount = computed(() => props.tasks.filter((task) => task.columnId === 'doing').length)
const progress = computed(() =>
  total.value === 0 ? 0 : Math.round((doneCount.value / total.value) * 100)
)

function requestReset() {
  if (!total.value) return
  confirmingReset.value = true
}

function confirmReset() {
  confirmingReset.value = false
  emit('reset')
}

function cancelReset() {
  confirmingReset.value = false
}
</script>

<template>
  <header class="navbar">
    <div class="navbar__brand">
      <span class="navbar__logo" aria-hidden="true">📋</span>
      <div>
        <h1 class="navbar__title">任务管理看板</h1>
        <p class="navbar__subtitle">
          共 {{ total }} 个任务 · 进行中 {{ doingCount }} · 已完成 {{ doneCount }}
        </p>
      </div>
    </div>

    <div class="navbar__progress" :aria-label="`完成进度 ${progress}%`">
      <div class="navbar__progress-bar">
        <span class="navbar__progress-fill" :style="{ width: `${progress}%` }"></span>
      </div>
      <span class="navbar__progress-text">{{ progress }}%</span>
    </div>

    <div class="navbar__actions">
      <ThemeSelector />

      <template v-if="confirmingReset">
        <button type="button" class="btn btn--ghost navbar__confirm" @click="cancelReset">
          取消
        </button>
        <button type="button" class="btn navbar__danger" data-action="confirm-reset" @click="confirmReset">
          确认清空
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="btn btn--ghost navbar__reset"
          data-action="reset"
          :disabled="!total"
          @click="requestReset"
        >
          重置
        </button>
        <button type="button" class="btn btn--primary navbar__add" data-action="add-task" @click="emit('add-task')">
          <span aria-hidden="true">＋</span> 新增任务
        </button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.navbar__logo {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
  font-size: 22px;
  flex-shrink: 0;
}

.navbar__title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.navbar__subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
}

.navbar__progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 160px;
  flex: 1;
}

.navbar__progress-bar {
  position: relative;
  flex: 1;
  height: 7px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-2);
  overflow: hidden;
}

.navbar__progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar__progress-text {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  min-width: 34px;
  text-align: right;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.navbar__reset:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.navbar__danger {
  background: var(--color-danger);
  color: #fff;
  border-color: transparent;
}

@media (max-width: 720px) {
  .navbar {
    padding: var(--space-3) var(--space-4);
  }

  .navbar__progress {
    order: 3;
    flex-basis: 100%;
  }

  .navbar__actions {
    margin-left: 0;
  }

  .navbar__add {
    padding: 8px 12px;
  }
}
</style>