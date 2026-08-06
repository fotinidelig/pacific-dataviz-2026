const FONT = {
  tick: 11,
  label: 12,
};

function formatTick(value, tickDivisor) {
  if (tickDivisor !== 1) {
    return `${value / tickDivisor}k`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${value / 1_000_000}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${value / 1_000}k`;
  }
  return String(value);
}

export const AxisLeft = ({
  yScale,
  pixelsPerTick = 50,
  innerWidth,
  label,
  tickDivisor = 1,
}) => {
  const minValue = yScale.domain()[0];
  const range = yScale.range();
  const height = Math.abs(range[0] - range[1]);
  const numberOfTicksTarget = Math.max(2, Math.floor(height / pixelsPerTick));

  return (
    <>
      {yScale.ticks(numberOfTicksTarget).map((value) => (
        <g
          key={value}
          transform={`translate(0, ${yScale(value)})`}
          overflow="visible"
        >
          <line
            x1={0}
            x2={innerWidth}
            y1={0}
            y2={0}
            stroke={value === minValue ? 'black' : '#e5e7eb'}
            zIndex={value === minValue ? 1000 : 0}
            strokeWidth={value === minValue ? 2 : 1}
          />
          <text
            x={-8}
            dy="0.32em"
            textAnchor="end"
            fill="#111827"
            style={{ fontSize: FONT.tick }}
          >
            {formatTick(value, tickDivisor)}
          </text>
        </g>
      ))}
      {label && (
        <text
          transform={`translate(${-44}, ${(range[0] + range[1]) / 2}) rotate(-90)`}
          textAnchor="middle"
          fill="#111827"
          style={{ fontSize: FONT.label, fontWeight: 500 }}
        >
          {label}
        </text>
      )}
    </>
  );
};
