/**
 * Simple year range control — dark-red accent, minimal chrome.
 */
export default function YearSlider({
  year,
  onChange,
  min = 1995,
  max = 2024,
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
      <input
        type="range"
        className="year-slider__input w-full cursor-pointer accent-dark-red drop-shadow-[0_1px_3px_color-mix(in_srgb,var(--color-dark-red)_45%,transparent)]"
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
      <div className="flex justify-between text-[0.7rem] leading-none text-dark-red/75 tabular-nums drop-shadow-[0_0_4px_var(--color-sand)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
