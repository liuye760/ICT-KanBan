<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  effect: {
    type: String,
    default: 'confetti'
  },
  duration: {
    type: Number,
    default: 1800
  }
})

const emit = defineEmits(['complete'])

const canvas = ref(null)
const effects = {
  confetti: { chars: ['🎉', '✨', '🎊', '•'], colors: ['#ff6b9a', '#5b5bd6', '#f59e0b', '#10b981', '#3ea6d8'] },
  stars: { chars: ['⭐', '✨', '🌟'], colors: ['#fbbf24', '#f59e0b', '#fde68a'] },
  hearts: { chars: ['💖', '💗', '❤️'], colors: ['#ff6b9a', '#ef4444', '#fb7185'] }
}

let frameId = 0
let particles = []
let startedAt = 0

function createParticles(context, width, height) {
  const preset = effects[props.effect] ?? effects.confetti
  const count = 46

  particles = Array.from({ length: count }, (_, index) => {
    const isText = index % 4 !== 0
    return {
      x: width / 2 + (Math.random() - 0.5) * width * 0.3,
      y: height / 2 + (Math.random() - 0.5) * height * 0.12,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 10 - 4,
      gravity: 0.22 + Math.random() * 0.18,
      size: isText ? 16 + Math.random() * 16 : 4 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.24,
      color: preset.colors[Math.floor(Math.random() * preset.colors.length)],
      char: isText ? preset.chars[Math.floor(Math.random() * preset.chars.length)] : '',
      opacity: 1
    }
  })

  context.setTransform(1, 0, 0, 1, 0, 0)
}

function draw(context, width, height) {
  context.clearRect(0, 0, width, height)

  for (const particle of particles) {
    particle.vy += particle.gravity
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vx *= 0.995
    particle.rotation += particle.vr
    particle.opacity = Math.max(0, 1 - (performance.now() - startedAt) / props.duration)

    context.save()
    context.translate(particle.x, particle.y)
    context.rotate(particle.rotation)
    context.globalAlpha = particle.opacity

    if (particle.char) {
      context.font = `${particle.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(particle.char, 0, 0)
    } else {
      context.fillStyle = particle.color
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
    }

    context.restore()
  }

  context.globalAlpha = 1
}

function loop() {
  const element = canvas.value
  if (!element) return
  const context = element.getContext('2d')
  if (!context) return

  draw(context, window.innerWidth, window.innerHeight)

  if (performance.now() - startedAt < props.duration) {
    frameId = requestAnimationFrame(loop)
  } else {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    particles = []
    emit('complete')
  }
}

function start() {
  const element = canvas.value
  if (!element) return

  const ratio = window.devicePixelRatio || 1
  element.width = window.innerWidth * ratio
  element.height = window.innerHeight * ratio
  element.style.width = `${window.innerWidth}px`
  element.style.height = `${window.innerHeight}px`

  const context = element.getContext('2d')
  if (!context) return
  context.scale(ratio, ratio)

  startedAt = performance.now()
  createParticles(context, window.innerWidth, window.innerHeight)

  cancelAnimationFrame(frameId)
  frameId = requestAnimationFrame(loop)
}

function stop() {
  cancelAnimationFrame(frameId)
  frameId = 0
  particles = []
  const element = canvas.value
  const context = element?.getContext('2d')
  if (element && context) context.clearRect(0, 0, window.innerWidth, window.innerHeight)
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) start()
    else stop()
  },
  { immediate: true }
)

onBeforeUnmount(stop)
</script>

<template>
  <canvas
    v-show="visible"
    ref="canvas"
    class="celebration"
    aria-hidden="true"
    data-testid="celebration"
  ></canvas>
</template>

<style scoped>
.celebration {
  position: fixed;
  inset: 0;
  z-index: var(--z-celebration);
  pointer-events: none;
}
</style>