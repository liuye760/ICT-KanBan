<script setup>
defineProps({
  icon: {
    type: String,
    default: '📭'
  },
  title: {
    type: String,
    default: '这里空空如也'
  },
  hint: {
    type: String,
    default: '拖拽任务卡片到此处试试'
  },
  actionText: {
    type: String,
    default: ''
  },
  actionIcon: {
    type: String,
    default: '+'
  }
})

defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon" aria-hidden="true">{{ icon }}</div>
    <p class="empty-state__title">{{ title }}</p>
    <p class="empty-state__hint">{{ hint }}</p>
    <button
      v-if="actionText"
      type="button"
      class="btn btn--ghost empty-state__action"
      @click="$emit('action')"
    >
      <span aria-hidden="true">{{ actionIcon }}</span>
      {{ actionText }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-7) var(--space-4);
  text-align: center;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  transition: border-color var(--transition), background var(--transition);
}

.empty-state__icon {
  font-size: 30px;
  animation: float 3.4s ease-in-out infinite;
}

.empty-state__title {
  font-weight: 600;
  color: var(--color-text);
  font-size: 13.5px;
}

.empty-state__hint {
  font-size: 12px;
}

.empty-state__action {
  margin-top: var(--space-2);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style>