import { computed, ref } from 'vue'
import { applyTheme } from '../utils/cssVariables'
import { themeList, themeNames, themes, type ThemeName } from '../config/themes'

const THEME_KEY = 'task-kanban-theme'

function readSavedTheme(): ThemeName {
  try {
    const saved = globalThis.localStorage?.getItem(THEME_KEY)
    if (saved && themeNames.includes(saved as ThemeName)) return saved as ThemeName
  } catch (error) {
    // 忽略读取失败，回退默认主题
  }
  return 'light'
}

const currentTheme = ref<ThemeName>('light')
const previewTheme = ref<ThemeName | null>(null)
const activeTheme = computed<ThemeName>(() => previewTheme.value ?? currentTheme.value)

let initialized = false

function initialize(): void {
  if (initialized) return
  initialized = true
  currentTheme.value = readSavedTheme()
  if (typeof document !== 'undefined') {
    applyTheme(currentTheme.value)
  }
}

export function useTheme() {
  initialize()

  function setTheme(name: ThemeName): void {
    if (!themeNames.includes(name)) return
    currentTheme.value = name
    previewTheme.value = null
    if (typeof document !== 'undefined') {
      applyTheme(name)
    }
    try {
      globalThis.localStorage?.setItem(THEME_KEY, name)
    } catch (error) {
      // 忽略写入失败，主题仍在本会话生效
    }
  }

  function preview(name: ThemeName): void {
    if (!themeNames.includes(name)) return
    previewTheme.value = name
    if (typeof document !== 'undefined') {
      applyTheme(name)
    }
  }

  function cancelPreview(): void {
    previewTheme.value = null
    if (typeof document !== 'undefined') {
      applyTheme(currentTheme.value)
    }
  }

  function cycleTheme(): ThemeName {
    const index = themeNames.indexOf(currentTheme.value)
    const next = themeNames[(index + 1) % themeNames.length]
    setTheme(next)
    return next
  }

  return {
    currentTheme,
    previewTheme,
    activeTheme,
    themeList,
    themes,
    setTheme,
    preview,
    cancelPreview,
    cycleTheme
  }
}