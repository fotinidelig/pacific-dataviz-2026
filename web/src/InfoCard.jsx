import "flag-icons/css/flag-icons.min.css";
import "./InfoCard.css";
import { colors } from "./theme";

const numberFmt = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const decimalFmt = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const currencyFmt = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatValue(value, kind = "number") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  if (kind === "currency") return currencyFmt.format(value);
  if (kind === "area") return `${numberFmt.format(value)} km²`;
  if (kind === "celsius") return `${decimalFmt.format(value)} °C`;
  // Data stores sea level as −0.2…0.2 ≈ −2…2 cm
  if (kind === "cm") return `${decimalFmt.format(Number(value) * 10)} cm`;
  if (kind === "year") return String(Math.round(Number(value)));
  if (kind === "anomaly") return decimalFmt.format(value);
  return numberFmt.format(value);
}

/** Stats rows for the light (socioeconomic) view. */
export function buildLightRows(country) {
  return [
    { label: "Population", value: formatValue(country.population) },
    { label: "Land area", value: formatValue(country.land_area, "area") },
    { label: "EEZ area", value: formatValue(country.eez_area, "area") },
    { label: "Exports", value: formatValue(country.exports_value, "currency") },
    { label: "Islands", value: formatValue(country.number_of_islands) },
  ];
}

/** Stats rows for the dark (climate) view. */
export function buildDarkRows(country, year) {
  return [
    { label: "Year", value: formatValue(year, "year") },
    {
      label: "Sea surface temp. anomaly",
      value: formatValue(country.ssta, "celsius"),
    },
    {
      label: "Surface temperature anomaly",
      value: formatValue(country.st_anom, "celsius"),
    },
    // {
    //   label: "Red List Index",
    //   value: formatValue(country.red_list_index, "anomaly"),
    // },
    {
      label: "Sea level anomaly",
      value: formatValue(country.sla, "cm"),
    },
  ];
}

/**
 * Shared country detail card (light + dark).
 * @param {{
 *   title: string,
 *   flagCode?: string,
 *   rows: { label: string, value: string }[],
 *   accentColor?: string,
 *   shadowColor?: string,
 *   onClose?: () => void,
 * }} props
 */
export default function InfoCard({
  title,
  flagCode,
  rows,
  accentColor = colors.teal,
  shadowColor = colors.tealLight,
  onClose,
}) {
  if (!title || !rows?.length) return null;

  const code = String(flagCode ?? "").toLowerCase();

  return (
    <aside
      className="info-card"
      aria-label={`${title} details`}
      style={{
        "--info-card-accent": accentColor,
        "--info-card-shadow": shadowColor,
      }}
    >
      <header className="info-card__header">
        <p className="info-card__title text-subheader">{title}</p>
        {code && (
          <div className="info-card__flag" aria-hidden="true">
            <span className={`fi fi-${code} fis`} />
          </div>
        )}
        {onClose && (
          <button
            type="button"
            className="info-card__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        )}
      </header>

      <div className="info-card__rule" />

      <dl className="info-card__stats">
        {rows.map(({ label, value }) => (
          <div key={label} className="info-card__row">
            <dt className="text-body_small">{label}</dt>
            <dd className="text-body">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
