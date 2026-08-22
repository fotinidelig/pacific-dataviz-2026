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

/** Always show + / − so rise vs fall is obvious. */
function formatSigned(value, suffix = "") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  const sign = n < 0 ? "−" : "+";
  return `${sign}${decimalFmt.format(Math.abs(n))}${suffix}`;
}

export function formatValue(value, kind = "number") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  if (kind === "currency") return currencyFmt.format(value);
  if (kind === "area") return `${numberFmt.format(value)} km²`;
  if (kind === "celsius") return formatSigned(value, " °C");
  // Data stores sea level as −0.2…0.2 ≈ −2…2 cm
  if (kind === "cm") return formatSigned(Number(value) * 10, " cm");
  if (kind === "year") return String(Math.round(Number(value)));
  if (kind === "anomaly") return formatSigned(value);
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

export const DARK_CARD_FOOTNOTES = [
  {
    mark: "*",
    text: "Anomalies are relative to the 1971–2000 climatological baseline.",
  },
  {
    mark: "**",
    text: "Difference between observed sea surface height and the 1993–2012 long-term reference baseline, expressed in metres (shown here in cm).",
  },
];

/** Stats rows for the dark (climate) view. */
export function buildDarkRows(country, year) {
  return [
    { label: "Year", value: formatValue(year, "year") },
    {
      label: "Sea surface temp. anomaly*",
      value: formatValue(country.ssta, "celsius"),
    },
    {
      label: "Surface temperature anomaly*",
      value: formatValue(country.st_anom, "celsius"),
    },
    {
      label: "Sea level anomaly**",
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
 *   footnotes?: { mark: string, text: string }[],
 *   accentColor?: string,
 *   shadowColor?: string,
 *   onClose?: () => void,
 * }} props
 */
export default function InfoCard({
  title,
  flagCode,
  rows,
  footnotes,
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

      {footnotes?.length > 0 && (
        <footer className="info-card__footnotes">
          {footnotes.map(({ mark, text }) => (
            <p key={mark} className="info-card__footnote">
              <span className="info-card__footnote-mark">{mark}</span>
              {text}
            </p>
          ))}
        </footer>
      )}
    </aside>
  );
}
