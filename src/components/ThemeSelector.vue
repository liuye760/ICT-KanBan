<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useToast } from '../composables/useToast'

const { currentTheme, activeTheme, themeList, setTheme, preview, cancelPreview } = useTheme()
const { showRandom } = useToast()

const open = ref(false)
const rootEl = ref(null)

function toggleMenu() {
  open.value = !open.value
  if (!open.value) cancelPreview()
}

function choose(name) {
  setTheme(name)
  open.value = false
  showRandom('info')
}

function onDocumentClick(event) {
  if (!rootEl.value?.contains(event.target)) {
    open.value = false
    cancelPreview()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="rootEl" class="theme-selector" @mouseleave="cancelPreview">
    <button
      type="button"
      class="btn btn--ghost theme-selector__trigger"
      :aria-expanded="String(open)"
      aria-haspopup="listbox"
      @click.stop="toggleMenu"
    >
      <span aria-hidden="true">{{ themeList.find((t) => t.name === activeTheme)?.icon }}</span>
      <span class="theme-selector__label">{{ currentTheme === 'light' ? '亮色' : currentTheme === 'dark' ? '暗色' : '多彩' }}</span>
      <span class="theme-selector__caret" :class="{ 'is-open': open }" aria-hidden="true">▾</span>
    </button>

    <Transition name="fade">
      <ul v-if="open" class="theme-selector__menu" role="listbox" aria-label="选择主题">
        <li v-for="theme in themeList" :key="theme.name">
          <button
            type="button"
            class="theme-option"
            :class="{ 'is-active': currentTheme === theme.name }"
            role="option"
            :aria-selected="String(currentTheme === theme.name)"
            @mouseenter="preview(theme.name)"
            @focus="preview(theme.name)"
            @click.stop="choose(theme.name)"
          >
            <span class="theme-option__icon" aria-hidden="true">{{ theme.icon }}</span>
            <span class="theme-option__text">
              <strong>{{ theme.label }}</strong>
              <small>{{ theme.description }}</small>
            </span>
            <span v-if="currentTheme === theme.name" class="theme-option__check" aria-hidden="true">✓</span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.theme-selector {
  position: relative;
}

.theme-selector__trigger {
  padding: 8px 14px;
  font-weight: 600;
}

.theme-selector__caret {
  font-size: 10px;
  transition: transform var(--transition);
}

.theme-selector__caret.is-open {
  transform: rotate(180deg);
}

.theme-selector__menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: var(--z-sticky);
  width: 208px;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  text-align: left;
  transition: background var(--transition);
}

.theme-option:hover,
.theme-option:focus-visible {
  background: var(--color-primary-soft);
}

.theme-option.is-active {
  background: var(--color-primary-soft);
}

.theme-option__icon {
  font-size: 16px;
}

.theme-option__text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.theme-option__text strong {
  font-size: 13px;
}

.theme-option__text small {
  font-size: 11px;
  color: var(--color-text-muted);
}

.theme-option__check {
  margin-left: auto;
  color: var(--color-primary);
  font-weight: 700;
}

@media (max-width: 720px) {
  .theme-selector__label {
    display: none;
  }
}
</style>