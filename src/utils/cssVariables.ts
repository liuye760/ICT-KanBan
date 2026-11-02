import { themes, type ThemeName } from '../config/themes'

export function applyTheme(themeName: ThemeName, root: HTMLElement = document.documentElement): void {
  const theme = themes[themeName] ?? themes.light
  for (const [property, value] of Object.entries(theme.variables)) {
    root.style.setProperty(property, value)
  }
  root.setAttribute('data-theme', theme.name)
}

export function getCssVariable(name: string, root: HTMLElement = document.documentElement): string {
  return getComputedStyle(root).getPropertyValue(name).trim()
}

export function resetTheme(root: HTMLElement = document.documentElement): void {
  const base = themes.light
  for (const property of Object.keys(base.variables)) {
    root.style.removeProperty(property)
  }
  root.removeAttribute('data-theme')
}