import countries from "../../../data/processed/countries-codes.json";

export default function CountryFilterButtons({ excludeCountries = [], onToggle }) {
  return (
    <div className="country-filters" role="group" aria-label="Exclude countries">
      {countries.map(({ country, code, color }) => {
        const excluded = excludeCountries.includes(country);

        return (
          <button
            key={code}
            type="button"
            onClick={() => onToggle(country)}
            aria-pressed={excluded}
            title={excluded ? `Show ${country}` : `Hide ${country}`}
            className={`rounded-lg country-filter-btn${excluded ? " country-filter-btn--excluded" : ""}`}
            style={{
              "--country-color": color,
            }}
          >
            <span className="country-filter-swatch" aria-hidden="true" />
            <span className="country-filter-label">{country}</span>
          </button>
        );
      })}
    </div>
  );
}
