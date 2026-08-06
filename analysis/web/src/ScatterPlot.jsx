import { useMemo, useState, useRef } from "react";
import { extent } from "d3-array";
import { scaleSqrt } from "d3-scale";
import { useDimensions } from "./use-dimensions";

const MARGIN = { top: 24, right: 24, bottom: 48, left: 64 };
const LAND_COLOR_LIGHT = "#dff7f2";
const LAND_COLOR_DARK = "#0f766e";

function parseRow(row) {
  const [country, year, landArea, code, population] = row;
  return {
    country,
    year,
    landArea: Number(landArea),
    code,
    population: Number(population),
  };
}

function formatArea(value) {
  return `${new Intl.NumberFormat("en").format(Math.round(value))} km²`;
}

function formatPopulation(value) {
  return new Intl.NumberFormat("en").format(Math.round(value));
}

function formatAxis(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

function AxisTicks({ scale, axis }) {
  const ticks = scale.ticks(5);

  return ticks.map((tick) => {
    const position = scale(tick);

    if (axis === "x") {
      return (
        <g key={tick} transform={`translate(${position}, 0)`}>
          <line className="axis-tick" y2={6} />
          <text className="tick-label" y={20} textAnchor="middle">
            {formatAxis(tick)}
          </text>
        </g>
      );
    }

    return (
      <g key={tick} transform={`translate(0, ${position})`}>
        <line className="axis-tick" x2={-6} />
        <text className="tick-label" x={-10} dy="0.32em" textAnchor="end">
          {formatAxis(tick)}
        </text>
      </g>
    );
  });
}

function Legend({ landExtent, populationExtent, sizeScale, colorScale, x, y }) {
  const popMinR = sizeScale(populationExtent[0]);
  const popMaxR = sizeScale(populationExtent[1]);
  const gradientId = "land-color-gradient";

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text className="legend-label" fontWeight="500">
        Population → size
      </text>
      <circle
        cx={popMinR}
        cy={18}
        r={popMinR}
        fill={colorScale(landExtent[0])}
      />
      <text className="legend-value" x={popMinR * 2 + 6} y={21}>
        {formatPopulation(populationExtent[0])}
      </text>
      <circle
        cx={110 + popMaxR}
        cy={18}
        r={popMaxR}
        fill={colorScale(landExtent[1])}
      />
      <text className="legend-value" x={110 + popMaxR * 2 + 6} y={21}>
        {formatPopulation(populationExtent[1])}
      </text>

      <text className="legend-label" y={52} fontWeight="500">
        Land cover → color
      </text>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={LAND_COLOR_LIGHT} />
          <stop offset="100%" stopColor={LAND_COLOR_DARK} />
        </linearGradient>
      </defs>
      <rect x={0} y={60} width={120} height={10} rx={2} fill={`url(#${gradientId})`} />
      <text className="legend-value" x={0} y={84}>
        {formatArea(landExtent[0])}
      </text>
      <text className="legend-value" x={120} y={84} textAnchor="end">
        {formatArea(landExtent[1])}
      </text>
    </g>
  );
}

export default function ScatterPlot({
  width,
  height,
  data,
  selectedCode = null,
}) {
  const [hoveredCode, setHoveredCode] = useState(null);

  const points = useMemo(() => data.map(parseRow), [data]);

  const innerWidth = Math.max(0, (width ?? 0) - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, (height ?? 0) - MARGIN.top - MARGIN.bottom);

  const landExtent = useMemo(() => extent(points, (d) => d.landArea), [points]);
  const populationExtent = useMemo(
    () => extent(points, (d) => d.population),
    [points],
  );

  const scales = useMemo(() => {
    const [landMin, landMax] = landExtent;
    const [popMin, popMax] = populationExtent;

    return {
      x: scaleSqrt()
        .domain([landMin, landMax])
        .range([0, innerWidth])
        .nice(),
      y: scaleSqrt()
        .domain([popMin, popMax])
        .range([innerHeight, 0])
        .nice(),
      size: scaleSqrt()
        .domain(populationExtent)
        .range([4, 28]),
      color: scaleSqrt()
        .domain(landExtent)
        .range([LAND_COLOR_LIGHT, LAND_COLOR_DARK]),
    };
  }, [innerWidth, innerHeight, landExtent, populationExtent]);

  const activeCode = hoveredCode ?? selectedCode ?? null;
  const hovered = points.find((d) => d.code === activeCode) ?? null;

  return (
    <svg
      className="chart-svg"
      width="100%"
      height="100%"
      overflow="visible"
      role="img"
      aria-label="Scatter plot of Pacific island land area and population"
    >
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        <line className="axis-line" x2={innerWidth} y1={innerHeight} y2={innerHeight} />
        <line className="axis-line" y2={innerHeight} />

        <g transform={`translate(0, ${innerHeight})`}>
          <AxisTicks scale={scales.x} axis="x" />
        </g>
        <AxisTicks scale={scales.y} axis="y" />

        <text
          className="axis-label"
          x={innerWidth / 2}
          y={innerHeight + 40}
          textAnchor="middle"
        >
          Land area (km²)
        </text>
        <text
          className="axis-label"
          transform={`translate(-44, ${innerHeight / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          Population
        </text>

        {points.map((d) => {
          const cx = scales.x(d.landArea);
          const cy = scales.y(d.population);
          const r = scales.size(d.population);
          const isActive = activeCode === d.code;
          const hasPinned = Boolean(selectedCode) && hoveredCode == null;
          const shouldDim = (hoveredCode != null || hasPinned) && !isActive;

          return (
            <circle
              key={d.code}
              className={`bubble${shouldDim ? " bubble--dimmed" : ""}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={scales.color(d.landArea)}
              stroke={isActive ? "#ffffff" : "#0f766e"}
              strokeWidth={isActive ? 1.5 : 1}
              onMouseEnter={() => setHoveredCode(d.code)}
              onMouseLeave={() => setHoveredCode(null)}
            />
          );
        })}

        {hovered && (
          <g
            className="tooltip"
            transform={`translate(${scales.x(hovered.landArea)}, ${scales.y(hovered.population)})`}
          >
            <rect
              className="tooltip-bg"
              x={14}
              y={-42}
              width={168}
              height={52}
              rx={4}
            />
            <text className="tooltip-text" x={22} y={-24} fontWeight="600">
              {hovered.country}
            </text>
            <text className="tooltip-text" x={22} y={-8}>
              {formatArea(hovered.landArea)}
            </text>
            <text className="tooltip-text" x={22} y={6}>
              {formatPopulation(hovered.population)} people
            </text>
          </g>
        )}

        <Legend
          landExtent={landExtent}
          populationExtent={populationExtent}
          sizeScale={scales.size}
          colorScale={scales.color}
          x={innerWidth - 210}
          y={innerHeight - 100}
        />
      </g>
    </svg>
  );
}

export function ResponsiveScatterPlot({ data, selectedCode = null }) {
  const containerRef = useRef(null);
  const { width, height } = useDimensions(containerRef);

  return (
    <div ref={containerRef} className="chart-shell">
      <ScatterPlot
        width={width}
        height={height}
        data={data}
        selectedCode={selectedCode}
      />
    </div>
  );
}
