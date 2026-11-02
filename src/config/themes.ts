export type ThemeName = 'light' | 'dark' | 'colorful'

export interface ThemeDefinition {
  name: ThemeName
  label: string
  icon: string
  description: string
  variables: Record<string, string>
}

export const themes: Record<ThemeName, ThemeDefinition> = {
  light: {
    name: 'light',
    label: '亮色',
    icon: '☀️',
    description: '清爽明亮',
    variables: {
      '--color-bg': '#f4f6fb',
      '--color-bg-gradient':
        'radial-gradient(circle at 12% 8%, #e8ecff 0%, transparent 46%), radial-gradient(circle at 88% 4%, #ffe9f2 0%, transparent 42%)',
      '--color-surface': '#ffffff',
      '--color-surface-2': '#f7f8fc',
      '--color-border': '#e5e8f0',
      '--color-text': '#1c2033',
      '--color-text-muted': '#7a8199',
      '--color-primary': '#5b5bd6',
      '--color-primary-soft': 'rgba(91, 91, 214, 0.1)',
      '--color-on-primary': '#ffffff',
      '--color-accent': '#ff6b9a',
      '--color-success': '#16a34a',
      '--color-warning': '#f59e0b',
      '--color-danger': '#ef4444',
      '--color-star': '#fbbf24',
      '--color-column-bg': 'rgba(255, 255, 255, 0.55)',
      '--color-shadow': 'rgba(28, 32, 51, 0.08)'
    }
  },
  dark: {
    name: 'dark',
    label: '暗色',
    icon: '🌙',
    description: '专注护眼',
    variables: {
      '--color-bg': '#12141c',
      '--color-bg-gradient':
        'radial-gradient(circle at 14% 6%, rgba(91, 91, 214, 0.28) 0%, transparent 48%), radial-gradient(circle at 86% 2%, rgba(255, 107, 154, 0.16) 0%, transparent 44%)',
      '--color-surface': '#1c1f2b',
      '--color-surface-2': '#252938',
      '--color-border': '#30354a',
      '--color-text': '#eef0f7',
      '--color-text-muted': '#9aa1b8',
      '--color-primary': '#7c7cff',
      '--color-primary-soft': 'rgba(124, 124, 255, 0.16)',
      '--color-on-primary': '#0f1118',
      '--color-accent': '#ff8fb3',
      '--color-success': '#34d399',
      '--color-warning': '#fbbf24',
      '--color-danger': '#f87171',
      '--color-star': '#fcd34d',
      '--color-column-bg': 'rgba(28, 31, 43, 0.72)',
      '--color-shadow': 'rgba(0, 0, 0, 0.45)'
    }
  },
  colorful: {
    name: 'colorful',
    label: '多彩',
    icon: '🎨',
    description: '活力缤纷',
    variables: {
      '--color-bg': '#fdf6ee',
      '--color-bg-gradient':
        'radial-gradient(circle at 10% 10%, #ffe0b8 0%, transparent 45%), radial-gradient(circle at 90% 6%, #cfe6ff 0%, transparent 48%), radial-gradient(circle at 50% 100%, #ffd9e9 0%, transparent 55%)',
      '--color-surface': '#fffdf9',
      '--color-surface-2': '#fff5e6',
      '--color-border': '#f2ddc2',
      '--color-text': '#2f2a24',
      '--color-text-muted': '#8d8073',
      '--color-primary': '#f0762b',
      '--color-primary-soft': 'rgba(240, 118, 43, 0.12)',
      '--color-on-primary': '#ffffff',
      '--color-accent': '#3ea6d8',
      '--color-success': '#2fa060',
      '--color-warning': '#e8a317',
      '--color-danger': '#e05252',
      '--color-star': '#f2b807',
      '--color-column-bg': 'rgba(255, 253, 249, 0.6)',
      '--color-shadow': 'rgba(120, 88, 52, 0.14)'
    }
  }
}

export const themeList: ThemeDefinition[] = Object.values(themes)

export const themeNames: ThemeName[] = Object.keys(themes) as ThemeName[]