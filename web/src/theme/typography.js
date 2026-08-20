/**
 * Typography theme — single source of truth for fonts, sizes, and weights.
 * CSS consumes values via applyTypographyTheme() (called from main.jsx).
 * SVG/chart components import fontType, fontSize, and fontWeight directly.
 *
 * main    — Krub: body, legend_small, axes, small headings
 * special — display font for titles / major headings (pick one below)
 *
 * Sizes are rem multipliers of the root font-size (typically 16px → body = 1rem).
 */

/** Display font options — all loaded in index.html. Change `activeSpecialFont` to switch. */
export const specialFonts = {
  arima: 'Arima, serif',
  rufina: 'Rufina, serif',
  bree: '"Bree Serif", serif',
  averia: '"Averia Serif Libre", serif',
}

/** @type {keyof typeof specialFonts} */
export const activeSpecialFont = 'bree'

// using 1.25 ratio
export const fontSize = {
  axis: 0.64, // ~10.24px
  legend_small: 0.55, // ~12.8px
  body: 1, // ~16px
  subheader: 1.953, // ~32px
  header: 3.815, // ~61px
}

export const fontWeight = {
  legend_small: 400,
  body: 400,
  subheader: 400,
  header: 400,
}

export const fontType = {
  main: 'Krub, sans-serif',
  special: specialFonts[activeSpecialFont],
}

export const fontFamilyVar = {
  main: '--font-family-main',
  special: '--font-family-special',
}

const fontSizeVar = {
  axis: '--font-size-axis',
  legend_small: '--font-size-legend_small',
  body: '--font-size-body',
  subheader: '--font-size-subheader',
  header: '--font-size-header',
}

/** Apply typography tokens as CSS custom properties on :root */
export function applyTypographyTheme() {
  const root = document.documentElement

  root.style.setProperty(fontFamilyVar.main, fontType.main)
  root.style.setProperty(fontFamilyVar.special, fontType.special)

  for (const [key, value] of Object.entries(fontSize)) {
    root.style.setProperty(fontSizeVar[key], `${value}rem`)
  }
}

/** CSS length string for SVG / inline styles, e.g. fontSizeRem('axis') → '0.64rem' */
export function fontSizeRem(key) {
  return `${fontSize[key]}rem`
}
