<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  existingCategories: {
    type: Array,
    default: () => []
  },
  defaultColumnId: {
    type: String,
    default: 'todo'
  }
})

const emit = defineEmits(['submit', 'close'])

const form = reactive({
  title: '',
  description: '',
  category: '',
  columnId: props.defaultColumnId,
  starred: false,
  urgent: false
})

const error = ref('')
const titleInput = ref(null)

const suggestions = computed(() => {
  const keyword = form.category.trim().toLowerCase()
  const pool = props.existingCategories ?? []
  if (!keyword) return pool.slice(0, 6)
  return pool.filter((item) => item.toLowerCase().includes(keyword) && item !== form.category).slice(0, 6)
})

watch(
  () => props.columns,
  (columns) => {
    if (columns.length && !columns.some((column) => column.id === form.columnId)) {
      form.columnId = columns[0].id
    }
  },
  { immediate: true }
)

function submit() {
  const title = form.title.trim()
  if (!title) {
    error.value = '请先填写任务标题'
    titleInput.value?.focus()
    return
  }

  error.value = ''
  emit('submit', {
    title,
    description: form.description.trim(),
    category: form.category.trim(),
    columnId: form.columnId,
    starred: form.starred,
    urgent: form.urgent
  })
}

function pickCategory(category) {
  form.category = category
}

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  titleInput.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="emit('close')">
    <section
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-heading"
      data-testid="add-task-modal"
    >
      <header class="modal__header">
        <div>
          <h2 id="add-task-heading" class="modal__title">新增任务</h2>
          <p class="modal__subtitle">把想法记下来，然后一步一步推进</p>
        </div>
        <button type="button" class="icon-btn modal__close" title="关闭" @click="emit('close')">
          ✕
        </button>
      </header>

      <form class="modal__form" novalidate @submit.prevent="submit">
        <label class="field">
          <span class="field__label">任务标题 <em aria-hidden="true">*</em></span>
          <input
            ref="titleInput"
            v-model="form.title"
            class="field__input"
            data-field="title"
            type="text"
            maxlength="80"
            placeholder="例如：完成看板交互优化"
            @input="error = ''"
          />
        </label>

        <label class="field">
          <span class="field__label">描述</span>
          <textarea
            v-model="form.description"
            class="field__input field__input--area"
            data-field="description"
            rows="3"
            maxlength="300"
            placeholder="补充一些细节（可选）"
          ></textarea>
        </label>

        <label class="field">
          <span class="field__label">分类</span>
          <input
            v-model="form.category"
            class="field__input"
            data-field="category"
            type="text"
            list="category-options"
            maxlength="20"
            placeholder="输入或选择已有分类"
          />
          <datalist id="category-options">
            <option v-for="item in existingCategories" :key="item" :value="item" />
          </datalist>
        </label>

        <div v-if="suggestions.length" class="category-suggestions">
          <button
            v-for="item in suggestions"
            :key="item"
            type="button"
            class="category-chip"
            @click="pickCategory(item)"
          >
            {{ item }}
          </button>
        </div>

        <label class="field">
          <span class="field__label">所在列</span>
          <select v-model="form.columnId" class="field__input" data-field="column">
            <option v-for="column in columns" :key="column.id" :value="column.id">
              {{ column.title }}
            </option>
          </select>
        </label>

        <div class="toggle-row">
          <button
            type="button"
            class="toggle-pill"
            :class="{ 'is-active': form.starred }"
            data-field="starred"
            :aria-pressed="String(form.starred)"
            @click="form.starred = !form.starred"
          >
            <span aria-hidden="true">★</span> 星标
          </button>
          <button
            type="button"
            class="toggle-pill toggle-pill--danger"
            :class="{ 'is-active': form.urgent }"
            data-field="urgent"
            :aria-pressed="String(form.urgent)"
            @click="form.urgent = !form.urgent"
          >
            <span aria-hidden="true">🔥</span> 紧急
          </button>
        </div>

        <p v-if="error" class="form-error" role="alert">{{ error }}</p>

        <footer class="modal__footer">
          <button type="button" class="btn btn--ghost" data-action="cancel" @click="emit('close')">
            取消
          </button>
          <button type="submit" class="btn btn--primary" data-action="submit">保存任务</button>
        </footer>
      </form>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background: rgba(14, 18, 32, 0.45);
  backdrop-filter: blur(4px);
  animation: fade-in 180ms ease both;
}

.modal {
  width: min(520px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: pop-in 240ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-3);
}

.modal__title {
  font-size: 18px;
  font-weight: 700;
}

.modal__subtitle {
  font-size: 12.5px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.modal__close {
  margin-left: auto;
  flex-shrink: 0;
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-5) var(--space-5);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.field__label em {
  color: var(--color-danger);
  font-style: normal;
}

.field__input {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text);
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
}

.field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  background: var(--color-surface);
}

.field__input--area {
  resize: vertical;
  min-height: 72px;
}

.category-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: -6px;
}

.category-chip {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  transition: transform var(--transition), background var(--transition);
}

.category-chip:hover {
  transform: translateY(-1px);
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.toggle-row {
  display: flex;
  gap: var(--space-2);
}

.toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  font-size: 12.5px;
  font-weight: 600;
  transition: all var(--transition);
}

.toggle-pill:hover {
  border-color: var(--color-star);
}

.toggle-pill.is-active {
  background: var(--color-star);
  border-color: transparent;
  color: #4a3400;
}

.toggle-pill--danger.is-active {
  background: var(--color-danger);
  color: #fff;
}

.form-error {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
  font-size: 12.5px;
  font-weight: 600;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>