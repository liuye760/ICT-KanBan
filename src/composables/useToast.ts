import { readonly, ref } from 'vue'
import { randomMessage, type ToastKind } from '../config/toastMessages'

export interface ToastItem {
  id: number
  message: string
  kind: ToastKind
  duration: number
}

const toasts = ref<ToastItem[]>([])
let seed = 0

export function useToast() {
  function show(message: string, kind: ToastKind = 'info', duration = 2600): number {
    const id = ++seed
    toasts.value.push({ id, message, kind, duration })
    return id
  }

  function showRandom(kind: ToastKind, duration = 2600): number {
    return show(randomMessage(kind), kind, duration)
  }

  function remove(id: number): void {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  function clear(): void {
    toasts.value = []
  }

  function success(message: string, duration = 2600): number {
    return show(message, 'info', duration)
  }

  function error(message: string, duration = 3200): number {
    return show(message, 'info', duration)
  }

  return {
    toasts: readonly(toasts),
    show,
    showRandom,
    remove,
    clear,
    success,
    error
  }
}