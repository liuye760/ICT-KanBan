export interface RippleOptions {
  color?: string
  duration?: number
}

export function useRipple() {
  function ripple(event: MouseEvent, options: RippleOptions = {}): void {
    const target = event.currentTarget as HTMLElement | null
    if (!target || typeof document === 'undefined') return

    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const span = document.createElement('span')

    span.style.position = 'absolute'
    span.style.borderRadius = '50%'
    span.style.pointerEvents = 'none'
    span.style.width = `${size}px`
    span.style.height = `${size}px`
    span.style.left = `${event.clientX - rect.left - size / 2}px`
    span.style.top = `${event.clientY - rect.top - size / 2}px`
    span.style.background = options.color ?? 'currentColor'
    span.style.opacity = '0.28'
    span.style.transform = 'scale(0)'
    span.style.transition = `transform ${options.duration ?? 500}ms ease, opacity ${
      options.duration ?? 500
    }ms ease`

    const previousPosition = target.style.position
    if (getComputedStyle(target).position === 'static') {
      target.style.position = 'relative'
    }
    target.style.overflow = 'hidden'
    target.appendChild(span)

    requestAnimationFrame(() => {
      span.style.transform = 'scale(2.4)'
      span.style.opacity = '0'
    })

    window.setTimeout(() => {
      span.remove()
      if (getComputedStyle(target).position === 'relative' && previousPosition === '') {
        target.style.position = ''
      }
    }, (options.duration ?? 500) + 60)
  }

  return { ripple }
}