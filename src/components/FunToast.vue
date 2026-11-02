<script setup>
import { onBeforeUnmount, reactive, watch } from 'vue'
import { useToast } from '../composables/useToast'

const { toasts, remove } = useToast()

const timers = new Map()
const paused = reactive(new Set())

const icons = {
  add: '✨',
  remove: '🍃',
  move: '🚀',
  star: '⭐',
  unstar: '☆',
  urgent: '🔥',
  calm: '😌',
  reset: '🌱',
  info: '💡'
}

function schedule(toast) {
  if (timers.has(toast.id)) return
  timers.set(
    toast.id,
    window.setTimeout(() => {
      timers.delete(toast.id)
      paused.delete(toast.id)
      remove(toast.id)
    }, toast.duration)
  )
}

function pause(toast) {
  const timer = timers.get(toast.id)
  if (timer) window.clearTimeout(timer)
  timers.delete(toast.id)
  paused.add(toast.id)
}

function resume(toast) {
  paused.delete(toast.id)
  schedule(toast)
}

watch(
  toasts,
  (list) => {
    for (const toast of list) {
      if (!paused.has(toast.id)) schedule(toast)
    }
    for (const id of [...timers.keys()]) {
      if (!list.some((toast) => toast.id === id)) {
        window.clearTimeout(timers.get(id))
        timers.delete(id)
      }
    }
  },
  { deep: true, immediate: true }
)

onBeforeUnmount(() => {
  for (const timer of timers.values()) window.clearTimeout(timer)
  timers.clear()
})
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast--${toast.kind}`, { 'is-paused': paused.has(toast.id) }]"
        role="status"
        @mouseenter="pause(toast)"
        @mouseleave="resume(toast)"
      >
        <span class="toast__icon" aria-hidden="true">{{ icons[toast.kind] ?? icons.info }}</span>
        <span class="toast__text">{{ toast.message }}</span>
        <button type="button" class="icon-btn toast__close" title="关闭提示" @click="remove(toast.id)">
          ✕
        </button>
        <span
          class="toast__bar"
          :style="{ animationDuration: `${toast.duration}ms` }"
          aria-hidden="true"
        ></span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
  width: min(320px, calc(100vw - 32px));
}

.toast {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 11px 14px;
  overflow: hidden;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.toast__icon {
  font-size: 15px;
}

.toast__text {
  flex: 1;
  font-size: 12.5px;
  font-weight: 600;
}

.toast__close {
  width: 22px;
  height: 22px;
  font-size: 10px;
}

.toast__bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2.5px;
  width: 100%;
  background: var(--color-primary);
  transform-origin: left center;
  animation: toast-countdown linear both;
}

.toast--star .toast__bar,
.toast--add .toast__bar {
  background: var(--color-star);
}

.toast--remove .toast__bar {
  background: var(--color-text-muted);
}

.toast--urgent .toast__bar {
  background: var(--color-danger);
}

.toast.is-paused .toast__bar {
  animation-play-state: paused;
}

@keyframes toast-countdown {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 260ms ease, transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

@media (max-width: 720px) {
  .toast-stack {
    right: var(--space-3);
    left: var(--space-3);
    bottom: var(--space-3);
    width: auto;
  }
}
</style>