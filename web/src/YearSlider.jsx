/**
 * Simple year range control — dark-red accent, minimal chrome.
 * Optional `markerYears` draw small ticks on story-point years.
 *
 * Range thumbs don’t travel the full width (they’re inset by ~half a thumb),
 * so marker % positions need a thumb-size correction to line up with values.
 */
const THUMB_SIZE_PX = 16;

function markerLeft(year, min, max) {
  const t = (year - min) / Math.max(1, max - min);
  // At t=0 → thumb/2 from left; at t=1 → thumb/2 from right
  return `calc(${t * 100}% + ${(0.5 - t) * THUMB_SIZE_PX}px)`;
}

export default function YearSlider({
  year,
  onChange,
  min = 1995,
  max = 2024,
  markerYears = [],
}) {
  return (
    <div
      className="year-slider pointer-events-auto absolute bottom-2 left-1/2 z-20 flex w-[min(18rem,calc(100%-2rem))] -translate-x-1/2 flex-col gap-0.5"
      role="group"
      aria-label="Climate year"
    >
      <div className="flex items-baseline justify-center gap-2 text-dark-red drop-shadow-[0_0_4px_var(--color-sand)]">
        <span className="text-body_small tabular-nums">{year}</span>
      </div>

      <div className="year-slider__track relative flex items-center">
        <div className="year-slider__markers pointer-events-none absolute inset-x-0 top-1/2 h-0" aria-hidden="true">
          {markerYears
            .filter((y) => y >= min && y <= max)
            .map((y) => (
              <span
                key={y}
                className="year-slider__marker absolute top-1/2 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-dark-red"
                style={{
                  left: markerLeft(y, min, max),
                  height: "0.85rem",
                }}
                title={String(y)}
              />
            ))}
        </div>
        <input
          type="range"
          className="year-slider__input relative z-10 w-full cursor-pointer accent-dark-red drop-shadow-[0_1px_3px_color-mix(in_srgb,var(--color-dark-red)_45%,transparent)]"
          min={min}
          max={max}
          step={1}
          value={year}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={year}
          aria-label="Select year"
        />
      </div>

      <div className="flex justify-between text-[0.7rem] leading-none text-dark-red/75 tabular-nums drop-shadow-[0_0_4px_var(--color-sand)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

