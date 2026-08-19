import "./CountryTooltip.css";

/**
 * Small hover label above a map bubble.
 * @param {'light' | 'dark'} theme — glow color follows the wipe theme
 */
export default function CountryTooltip({ country, x, y, theme = "light" }) {
  if (!country) return null;

  return (
    <div
      role="tooltip"
      className={`country-tooltip country-tooltip--${theme}`}
      style={{ left: x, top: y }}
    >
      {country}
    </div>
  );
}
