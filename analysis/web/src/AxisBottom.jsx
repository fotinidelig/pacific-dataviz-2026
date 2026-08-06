import * as d3 from "d3";

const PRIMARY_TICK_LENGTH = 6;
const SECONDARY_TICK_LENGTH = 3;
const MINOR_SUBDIVISIONS = 2;

const FONT = {
  primary: 11,
  secondary: 9,
  label: 12,
};

const SECONDARY_COLOR = "black";
const PRIMARY_COLOR = "black";
const GRID_COLOR = "#e5e7eb";

function yearsInDomain(xScale, step) {
  const [d0, d1] = xScale.domain();
  const start = Math.ceil(d0 / step) * step;
  const years = [];
  for (let y = start; y <= d1 + 1e-9; y += step) {
    years.push(Math.round(y));
  }
  return years;
}

export const AxisBottom = ({
  xScale,
  pixelsPerTick = 50,
  innerHeight,
  label,
}) => {
  const minValue = xScale.domain()[0];
  const range = xScale.range();
  const width = Math.abs(range[1] - range[0]);
  const numberOfTicksTarget = Math.max(2, Math.floor(width / pixelsPerTick));

  const [d0, d1] = xScale.domain();
  const majorStep = d3.tickStep(d0, d1, numberOfTicksTarget);
  const minorStep =
    majorStep > 1 ? d3.tickStep(0, majorStep, MINOR_SUBDIVISIONS) : null;

  const primaryYears = yearsInDomain(xScale, majorStep);
  const primarySet = new Set(primaryYears);
  const secondaryYears =
    minorStep != null && minorStep < majorStep
      ? yearsInDomain(xScale, minorStep).filter((y) => !primarySet.has(y))
      : [];

  return (
    <>
      {/* {secondaryYears.map((year) => (
        <g key={`minor-${year}`} transform={`translate(${xScale(year)}, 0)`}>
          <line y2={SECONDARY_TICK_LENGTH} stroke={SECONDARY_COLOR} />
          <text
            y={PRIMARY_TICK_LENGTH + 8}
            textAnchor="middle"
            fill={SECONDARY_COLOR}
            style={{ fontSize: FONT.secondary }}
          >
            {`'${String(year).slice(-2)}`}
          </text>
        </g>
      ))} */}
      {primaryYears.map((year) => (
        <g key={`major-${year}`} transform={`translate(${xScale(year)}, 0)`}>
          <line y1={0} y2={-innerHeight} stroke={year === minValue ? 'black' : GRID_COLOR} strokeWidth={1} />
          <line y2={PRIMARY_TICK_LENGTH} stroke={PRIMARY_COLOR} />
          <text
            y={PRIMARY_TICK_LENGTH + 17}
            textAnchor="middle"
            fill={PRIMARY_COLOR}
            style={{ fontSize: FONT.primary, fontWeight: 500 }}
          >
            {year}
          </text>
        </g>
      ))}
      {label && (
        <text
          x={(range[0] + range[1]) / 2}
          y={40}
          textAnchor="middle"
          fill={PRIMARY_COLOR}
          style={{ fontSize: FONT.label, fontWeight: 500 }}
        >
          {label}
        </text>
      )}
    </>
  );
};
