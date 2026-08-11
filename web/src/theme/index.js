import { applyColorTheme } from './colors.js'
import { applyTypographyTheme } from './typography.js'

export { colors, chartPalette, applyColorTheme } from './colors.js'

export {
  fontSize,
  fontWeight,
  fontType,
  fontFamilyVar,
  fontSizeRem,
  applyTypographyTheme,
} from './typography.js'

/** Apply all theme tokens as CSS custom properties on :root */
export function applyTheme() {
  applyColorTheme()
  applyTypographyTheme()
}
