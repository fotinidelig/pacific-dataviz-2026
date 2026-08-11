/**
 * Load climate anomaly CSVs (exported from PDH / notebooks) and filter by year.
 *
 *   seal_level_anomaly.csv              → sla
 *   sea_surface_temperature_anomaly.csv → ssta
 *   surface_temperature_anomaly.csv     → st_anom
 *
 * Pitcairn (PN) is absent from sla and ssta; those values stay null.
 */

import { csvParse } from "d3-dsv";
import { extent } from "d3-array";

/** App attribute → public CSV path (symlinked from data/processed/). */
export const CLIMATE_CSV = {
  sla: "/data/seal_level_anomaly.csv",
  ssta: "/data/sea_surface_temperature_anomaly.csv",
  st_anom: "/data/surface_temperature_anomaly.csv",
};

/** Cache full parsed tables so changing year does not re-fetch. */
const csvCache = new Map();

/**
 * @param {string} url
 * @returns {Promise<{ REF_AREA: string, year: number, value: number|null }[]>}
 */
async function loadClimateCsv(url) {
  if (csvCache.has(url)) return csvCache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);

  const rows = csvParse(await res.text()).map((row) => ({
    REF_AREA: row.REF_AREA,
    year: +row.TIME_PERIOD,
    value:
      row.value == null || row.value === "" ? null : Number(row.value),
  }));

  csvCache.set(url, rows);
  return rows;
}

/**
 * One indicator for one year → map REF_AREA → value.
 * @param {'sla'|'ssta'|'st_anom'} attribute
 * @param {number} year
 * @returns {Promise<Record<string, number|null>>}
 */
export async function loadPdhIndicator(attribute, year) {
  const url = CLIMATE_CSV[attribute];
  if (!url) throw new Error(`Unknown climate attribute: ${attribute}`);

  const rows = await loadClimateCsv(url);
  const byArea = {};
  for (const row of rows) {
    if (row.year !== year) continue;
    byArea[row.REF_AREA] = row.value;
  }
  return byArea;
}

/**
 * Shared domain for st_anom + ssta across all years (for a stable color scale).
 * @returns {Promise<[number, number]>}
 */
export async function loadTemperatureAnomalyDomain() {
  const [stRows, sstRows] = await Promise.all([
    loadClimateCsv(CLIMATE_CSV.st_anom),
    loadClimateCsv(CLIMATE_CSV.ssta),
  ]);
  const values = [...stRows, ...sstRows]
    .map((r) => r.value)
    .filter((v) => v != null && !Number.isNaN(v));
  return extent(values);
}

/**
 * Load sla, ssta, and st_anom for one year, keyed by REF_AREA.
 * @param {number} year
 * @returns {Promise<Record<string, { sla: number|null, ssta: number|null, st_anom: number|null }>>}
 */
export async function loadPdhClimateYear(year) {
  const [sla, ssta, st_anom] = await Promise.all([
    loadPdhIndicator("sla", year),
    loadPdhIndicator("ssta", year),
    loadPdhIndicator("st_anom", year),
  ]);

  const codes = new Set([
    ...Object.keys(sla),
    ...Object.keys(ssta),
    ...Object.keys(st_anom),
  ]);

  const byArea = {};
  for (const code of codes) {
    byArea[code] = {
      sla: sla[code] ?? null,
      ssta: ssta[code] ?? null,
      st_anom: st_anom[code] ?? null,
    };
  }
  return byArea;
}
