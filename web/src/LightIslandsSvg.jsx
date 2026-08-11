import { useEffect, useState, useRef, useMemo } from "react";
import { useDimensions } from "./use-dimensions.jsx";
import { scaleLinear, scaleSqrt, scaleLog } from "d3-scale";
import { extent, max } from "d3-array";
import { interpolateRgb } from "d3-interpolate";
import { csvParse } from "d3-dsv";
import { colors } from "./theme";
import {
  MAP_MARGIN,
  BUBBLE_MIN_R,
  BUBBLE_MAX_R,
  EEZ_MIN_R,
  EEZ_MAX_R,
} from "./config.js";

function IslandsCoords({ x, y, r1, r2, num_islands}) {
  if (num_islands <= 1) return [];
  const coords = [];
  const offset = Math.random() * 2 * Math.PI;
  for (let i = 0; i < num_islands; i++) {
    // outer radius is 60% of the eez radius for a more compact layout
    const r = r1*1.05 + (r2*.6 - r1*1.05) * Math.sqrt(Math.random());
    const angle = offset + i * (2 * Math.PI) / num_islands;
    coords.push({
      x: x + r * Math.cos(angle),
      y: y + r * Math.sin(angle),
    });
  }
  return coords;
}

export default function LightIslandsSvg({
  width,
  height,
  selectedId = null,
  onSelectCountry,
}) {
  const [hovered, setHovered] = useState(null);
  const [data, setData] = useState(null);

  const handleIslandClick = (country) => {
    if (!onSelectCountry) return;
    if (selectedId != null && country.REF_AREA === selectedId) {
      onSelectCountry(null);
      return;
    }
    onSelectCountry(country);
  };
  useEffect(() => {
    Promise.all([
      fetch("/data/pacific_countries_2024.json").then((res) => res.json()),
      fetch("/data/country_centroid_wgs84.csv")
        .then((res) => res.text())
        .then(csvParse),
    ]).then(([countries, centroids]) => {
      const byName = Object.fromEntries(
        centroids.map((row) => [
          row.Country,
          {
            latitude: +row.latitude,
            longitude: +row.longitude,
          },
        ]),
      );

      setData(
        countries.map((d) => {
          const key = d.country;
          const centroid = byName[key];
          return {
            ...d,
            map_latitude: centroid?.latitude ?? d.eez_latitude,
            map_longitude: centroid?.longitude ?? d.eez_longitude,
          };
        }),
      );
    });
  }, []);

  // Hooks must run unconditionally — compute before any early return.
  // Memoize so IslandsCoords' Math.random() positions stay stable across re-renders.
  const points = useMemo(() => {
    if (!data || !width || !height) return null;

    const MARGIN = MAP_MARGIN;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;
    const toMapLon = (lon) => (lon < 0 ? lon + 360 : lon);

    const xScale = scaleLinear()
      .domain(extent(data, (d) => toMapLon(d.map_longitude)))
      .range([MARGIN.left, width - MARGIN.right]);

    const yScale = scaleLinear()
      .domain(extent(data, (d) => d.map_latitude))
      .range([MARGIN.top + innerHeight, MARGIN.top]);

    const rScale = scaleSqrt()
      .domain([0, max(data, (d) => d.land_area)])
      .range([BUBBLE_MIN_R, BUBBLE_MAX_R]);

    const eezRScale = scaleSqrt()
      .domain([0, max(data, (d) => d.eez_area)])
      .range([EEZ_MIN_R, EEZ_MAX_R]);

    // Log population → sand (low) … blue #2B5F8A (high). Matches np.log exploration.
    const popExtent = extent(
      data.filter((d) => d.population != null && d.population > 0),
      (d) => d.population,
    );
    const popColor = scaleLog()
      .domain(popExtent)
      .range([colors.sand, colors.blue])
      .interpolate(interpolateRgb);

    return data.map((d) => ({
      ...d,
      x: xScale(toMapLon(d.map_longitude)),
      y: yScale(d.map_latitude),
      r: rScale(d.land_area),
      eez_r: eezRScale(d.eez_area),
      fill:
        d.population != null && d.population > 0
          ? popColor(d.population)
          : colors.sand,
      islandsCoords: IslandsCoords({
        x: xScale(toMapLon(d.map_longitude)),
        y: yScale(d.map_latitude),
        r1: rScale(d.land_area),
        r2: eezRScale(d.eez_area),
        num_islands: d.log_number_of_islands,
      }),
    }));
  }, [data, width, height]);
  if (!points) return null;
  return (
    <div className="relative h-full w-full" >
      <svg width={width} height={height} className="bubbles">
        <defs>
        <radialGradient id="eez-sea">
            <stop offset="0%" stopColor="#2A959A" stopOpacity={0.8}/>
            <stop offset="45%" stopColor={colors.teal} stopOpacity={0.65}/>
            <stop offset="75%" stopColor={colors.tealLight} stopOpacity={0.5}/>
            <stop offset="100%" stopColor={colors.tealLight} stopOpacity={0}/>
        </radialGradient>
        </defs>
        {points.map((d) => {
          const islandCircles = d.islandsCoords.map((c) => (
            <circle className="eez-islands"
              key={`islands-${d.REF_AREA}-${c.x}-${c.y}`}
              cx={c.x}
              cy={c.y}
              r={3}
              fill={colors.sand}
              stroke='white'
              strokeWidth={0.5}
            />
          ));
          return (
            <g key={`${d.REF_AREA}-eez`}>
              <circle className="eez"
                cx={d.x}
                cy={d.y}
                r={d.eez_r}
                fill="url(#eez-sea)"
                // stroke={colors.tealLight}
                style={{ pointerEvents: "none" }}
              />
              {islandCircles}
            </g>
          );
        })}
        {points.map((d) => (
          <g key={`${d.REF_AREA}-land`}>
            <circle className="islands"
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={d.fill}
              fillOpacity={0.85}
              onMouseEnter={() =>
                setHovered({
                  country: d.country,
                  x: d.x,
                  y: d.y - d.r,
                })
              }
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleIslandClick(d)}
              style={{ cursor: "pointer" }}
            />
            {d.atolls > 0 && (
              <circle
                className="atolls"
                cx={d.x - d.r * 0.3 + 4}
                cy={d.y}
                r={d.r * 0.7}
                fill={colors.tealLight}
                pointerEvents="none"
              />
            )}
          </g>
        ))}
        {points.map((d) => (
          <text
            key={`label-${d.REF_AREA}`}
            x={d.x}
            y={d.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="pointer-events-none text-axis fill-navy"
          >
            {d.REF_AREA}
          </text>
        ))}
      </svg>
      {hovered && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded bg-navy px-3 py-2 text-sm font-medium text-sand shadow-sm"
          style={{ left: hovered.x, top: hovered.y - 8 }}
        >
          {hovered.country}
        </div>
      )}
    </div>
  );
}

export function ResponsiveLightIslandsSvg({
  selectedId = null,
  onSelectCountry,
}) {
  const wrapperRef = useRef(null);
  const { width, height } = useDimensions(wrapperRef);

  return (
    <div ref={wrapperRef} className="h-full w-full">
      <LightIslandsSvg
        width={width}
        height={height}
        selectedId={selectedId}
        onSelectCountry={onSelectCountry}
      />
    </div>
  );
}
