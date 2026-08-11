import { useEffect, useState, useRef, useMemo } from "react";
import { useDimensions } from "./use-dimensions.jsx";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { interpolateRgb } from "d3-interpolate";
import { extent, max } from "d3-array";
import { csvParse } from "d3-dsv";
import { colors } from "./theme";
import {
  MAP_MARGIN,
  BUBBLE_MIN_R,
  BUBBLE_MAX_R,
  EEZ_MIN_R,
  EEZ_MAX_R,
  SLA_RING_GAP,
} from "./config.js";

/** 0.1 anomaly ≈ 1 cm ≈ one ring (−0.2 → 2 inward, +0.2 → 2 outward). */
function slaRingCount(sla) {
  if (sla == null || Number.isNaN(sla) || sla === 0) return 0;
  return Math.round(Math.abs(sla) * 10);
}

function slaRingRadii(islandR, sla) {
  const n = slaRingCount(sla);
  if (n === 0) return [];
  const radii = [];
  for (let i = 1; i <= n; i++) {
    // Negative: rings inside the island (outer → inner).
    // Positive: rings outside the island (inner → outer).
    radii.push(sla < 0 ? islandR - i * SLA_RING_GAP : islandR + i * SLA_RING_GAP);
  }
  return radii.filter((r) => r > 0);
}

/**
 * Dark climate view — sand ground; encodings:
 *   st_anom → island fill (shared temp color scale)
 *   ssta    → EEZ-scaled radial glow (same color scale)
 *   sla     → mustard stroke rings (inward if negative, outward if positive)
 */
export default function DarkIslandsSvg({
  width,
  height,
  year,
  pdhByArea,
  tempDomain,
}) {
  const [data, setData] = useState(null);

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
          const centroid = byName[d.country];
          return {
            ...d,
            map_latitude: centroid?.latitude ?? d.eez_latitude,
            map_longitude: centroid?.longitude ?? d.eez_longitude,
          };
        }),
      );
    });
  }, []);

  const tempColor = useMemo(() => {
    if (!tempDomain) return null;
    return scaleLinear()
      .domain(tempDomain)
      .range([colors.tealLight, colors.darkRed])
      .interpolate(interpolateRgb)
      .clamp(true);
  }, [tempDomain]);

  const points = useMemo(() => {
    if (!data || !width || !height || !tempColor) return null;

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

    return data.map((d) => {
      const climate = pdhByArea?.[d.REF_AREA] ?? {
        sla: null,
        ssta: null,
        st_anom: null,
      };
      const r = rScale(d.land_area);
      return {
        ...d,
        ...climate,
        x: xScale(toMapLon(d.map_longitude)),
        y: yScale(d.map_latitude),
        r,
        eez_r: eezRScale(d.eez_area),
        fill:
          climate.st_anom != null
            ? tempColor(climate.st_anom)
            : colors.sand,
        sstaColor:
          climate.ssta != null ? tempColor(climate.ssta) : null,
        slaRadii: slaRingRadii(r, climate.sla),
      };
    });
  }, [data, width, height, pdhByArea, tempColor]);

  if (!points) return null;

  return (
    <div className="h-full w-full" style={{ backgroundColor: colors.sand }}>
      <svg width={width} height={height} className="bubbles-dark">
        <defs>
          {points.map(
            (d) =>
              d.sstaColor && (
                <radialGradient
                  key={`ssta-grad-${d.REF_AREA}`}
                  id={`ssta-grad-${d.REF_AREA}`}
                >
                  <stop offset="0%" stopColor={d.sstaColor} stopOpacity={0.85} />
                  <stop offset="45%" stopColor={d.sstaColor} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={d.sstaColor} stopOpacity={0} />
                </radialGradient>
              ),
          )}
        </defs>

        {/* Sea-surface temperature halo (behind islands) */}
        {points.map(
          (d) =>
            d.sstaColor && (
              <circle
                key={`ssta-${d.REF_AREA}`}
                cx={d.x}
                cy={d.y}
                r={d.eez_r}
                fill={`url(#ssta-grad-${d.REF_AREA})`}
                style={{ pointerEvents: "none" }}
              />
            ),
        )}

        {/* Island fill = surface temperature anomaly */}
        {points.map((d) => (
          <g key={`${d.REF_AREA}-dark-land`}>
            <circle
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={d.fill}
              fillOpacity={0.95}
            />
            {d.slaRadii.map((ringR, i) => (
              <circle
                key={`sla-${d.REF_AREA}-${i}`}
                cx={d.x}
                cy={d.y}
                r={ringR}
                fill="none"
                stroke={colors.mustard}
                strokeWidth={1.75}
                style={{ pointerEvents: "none" }}
              />
            ))}
            <text
              x={d.x}
              y={d.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none text-axis"
              fill={colors.sand}
            >
              {d.REF_AREA}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ResponsiveDarkIslandsSvg({ year, pdhByArea, tempDomain }) {
  const wrapperRef = useRef(null);
  const { width, height } = useDimensions(wrapperRef);

  return (
    <div ref={wrapperRef} className="h-full w-full">
      <DarkIslandsSvg
        width={width}
        height={height}
        year={year}
        pdhByArea={pdhByArea}
        tempDomain={tempDomain}
      />
    </div>
  );
}
