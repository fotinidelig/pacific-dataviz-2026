/**
 * Color theme — SINGLE source of truth for hex values.
 *
 * - Charts / SVG: import { colors } from './theme'
 * - CSS: use var(--color-*) after applyColorTheme() (main.jsx)
 * - Tailwind: @theme inline in index.css maps utilities (bg-navy, …) → those vars
 *
 * Edit hex ONLY here. Do not duplicate colors in index.css.
 */

export const colors = {
  navy: '#003F72',
  blue: '#2B5F8A',
  blueMuted: '#809FB9',
  teal: '#67B09B',
  tealLight: '#ABD3C7',
  sand: '#E3DED9',
  darkRed: '#772432',
  lightRed: '#B17371',
  mustard: '#FDD085',
}

/** camelCase key → --color-kebab-case */
export function colorCssVar(key) {
  const kebab = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
  return `--color-${kebab}`
}

/** Ordered palette for categorical marks. */
export const chartPalette = Object.values(colors)

/** Apply color tokens as CSS custom properties on :root */
export function applyColorTheme() {
  const root = document.documentElement

  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(colorCssVar(key), value)
  }
}
