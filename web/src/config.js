/**
 * App / chart configuration — single place for shared numeric knobs.
 * Import from components; do not duplicate these literals in SVG files.
 *
 * Colors stay in theme/colors.js; typography in theme/typography.js.
 */

/** Map layout margins (same for light & dark so wipe marks stay aligned). */
export const MAP_MARGIN = { top: 70, right: 70, bottom: 70, left: 70 };

/** Land bubble radius range (px) — scaleSqrt of land_area. */
export const BUBBLE_MIN_R = 15;
export const BUBBLE_MAX_R = 50;

/** EEZ / SSTA halo radius range (px) — scaleSqrt of eez_area. */
export const EEZ_MIN_R = 30;
export const EEZ_MAX_R = 130;

/** Gap between sea-level anomaly rings (px). */
export const SLA_RING_GAP = 4;

/** Climate year slider (overlap of anomaly CSVs from 1995). */
export const YEAR_MIN = 1995;
export const YEAR_MAX = 2024;

export const MAX_BOATS = 6;
