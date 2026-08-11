import "flag-icons/css/flag-icons.min.css";
import "./InfoCard.css";

const numberFmt = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const currencyFmt = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatValue(value, kind = "number") {
  if (value == null || Number.isNaN(value)) return "—";
  if (kind === "currency") return currencyFmt.format(value);
  if (kind === "area") return `${numberFmt.format(value)} km²`;
  return numberFmt.format(value);
}

/**
 * Country detail card — keep structure simple for later content tweaks.
 * @param {{ country: object, onClose?: () => void }} props
 */
export default function InfoCard({ country, onClose }) {
  if (!country) return null;
  const flagCode = String(country.REF_AREA ?? "").toLowerCase();

  const rows = [
    { label: "Population", value: formatValue(country.population) },
    { label: "Land area", value: formatValue(country.land_area, "area") },
    { label: "EEZ area", value: formatValue(country.eez_area, "area") },
    { label: "Exports", value: formatValue(country.exports_value, "currency") },
    {
      label: "Islands",
      value: formatValue(country.number_of_islands),
    },
  ];

  return (
    <aside className="info-card" aria-label={`${country.country} details`}>
      <header className="info-card__header">
        <p className="info-card__title text-subheader">{country.country}</p>
        <div className="info-card__flag" aria-hidden="true">
          <span className={`fi fi-${flagCode} fis`} />
        </div>
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
