/**
 * @fileoverview YYC³餐饮行业智能化平台 - 主题类型定义
 * @description 主题系统的类型定义
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

export type ThemeMode = 'light' | 'dark' | 'auto'

export type ColorScheme = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface ThemeColors {
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
  secondary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
  success: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
  warning: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
  danger: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
  neutral: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[]
    mono: string[]
  }
  fontSize: {
    xs: [string, { lineHeight: string }]
    sm: [string, { lineHeight: string }]
    base: [string, { lineHeight: string }]
    lg: [string, { lineHeight: string }]
    xl: [string, { lineHeight: string }]
    '2xl': [string, { lineHeight: string }]
    '3xl': [string, { lineHeight: string }]
    '4xl': [string, { lineHeight: string }]
    '5xl': [string, { lineHeight: string }]
    '6xl': [string, { lineHeight: string }]
    '7xl': [string, { lineHeight: string }]
    '8xl': [string, { lineHeight: string }]
    '9xl': [string, { lineHeight: string }]
  }
  fontWeight: {
    thin: string
    extralight: string
    light: string
    normal: string
    medium: string
    semibold: string
    bold: string
    extrabold: string
    black: string
  }
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

export interface ThemeBorderRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

export interface ThemeShadows {
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
  none: string
}

export interface Theme {
  id: string
  name: string
  mode: ThemeMode
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadows
  zIndex: {
    dropdown: number
    sticky: number
    fixed: number
    modalBackdrop: number
    modal: number
    popover: number
    tooltip: number
  }
}

export interface ThemeConfig {
  defaultTheme: string
  themes: Theme[]
  enableDarkMode: boolean
  enableSystemTheme: boolean
  persistTheme: boolean
  themeStorageKey: string
}
