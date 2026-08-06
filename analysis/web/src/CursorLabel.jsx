const CHAR_WIDTH = 0.5;
const DEFAULT_FONT_SIZE = 14;

function lineWidth(text, fs) {
  return text.length * fs * CHAR_WIDTH;
}

/**
 * Single-country cursor tooltip.
 *
 * label shape: { country: string, rest: string }
 * Example: { country: "Fiji", rest: " in 2023: 924,145" }
 */
export function CursorLabel({
  x,
  y,
  label,
  countryColors,
  fontSize: fs = DEFAULT_FONT_SIZE,
  textAnchor = "middle",
  padX = 4,
  padY = 3,
  pointerEvents = "none",
}) {
  if (!label?.country) return null;

  const { country, rest = "" } = label;
  const color = countryColors?.[country] ?? "#111827";
  const fullText = `${country}${rest}`;
  const textWidth = lineWidth(fullText, fs);
  const textHeight = fs * 1.35;

  const rectX =
    textAnchor === "end"
      ? x - textWidth - padX
      : textAnchor === "middle"
        ? x - textWidth / 2 - padX
        : x - padX;

  const textY = y + padY + fs / 2;

  return (
    <g pointerEvents={pointerEvents} overflow="visible">
      <rect
        x={rectX}
        y={y}
        width={textWidth + padX * 3}
        height={textHeight + padY * 2}
        fill="white"
        stroke={color}
        strokeWidth={2}
        rx={5}
      />
      <text
        className="text-cursor"
        x={x}
        y={textY}
        textAnchor={textAnchor}
        fontSize={fs}
        dominantBaseline="middle"
      >
        <tspan fontWeight={700} fill='black'>
          {country}
        </tspan>
        <tspan fill="#111827">{rest}</tspan>
      </text>
    </g>
  );
}
