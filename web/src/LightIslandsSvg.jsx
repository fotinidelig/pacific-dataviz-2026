import { useEffect, useState, useRef, useMemo } from "react";
import { useDimensions } from "./use-dimensions.jsx";
import { scaleLinear, scaleSqrt, scaleLog } from "d3-scale";
import { extent, max } from "d3-array";
import { interpolateRgb } from "d3-interpolate";
import { csvParse } from "d3-dsv";
import { colors } from "./theme";
import { motion } from "motion/react";
import { fontType } from "./theme/typography.js";
import { boatCoords } from "./boatCoords.js";
import { islandsCoords } from "./islandsCoords.js";
import CountryTooltip from "./CountryTooltip.jsx";
import boat from "./assets/boat_blue.svg";

import {
  MAP_MARGIN,
  BUBBLE_MIN_R,
  BUBBLE_MAX_R,
  EEZ_MIN_R,
  EEZ_MAX_R,
  MAX_BOATS,
  MAX_ISLANDS,
} from "./config.js";

const HIGHLIGHT_SPRING = { type: "spring", stiffness: 160, damping: 24, mass: 0.7 };

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

    const boatExtent = extent(
        data.filter((d) => d.exports_value != null && d.exports_value > 0),
        (d) => d.exports_value,
      );
    const boatScale = scaleLog()
      .domain(boatExtent)
      .range([1, MAX_BOATS]);

    const islandsExtent = extent(data, (d) => d.number_of_islands);
    const islandsScale = scaleLog()
      .domain(islandsExtent)
      .range([0, MAX_ISLANDS]);
  
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
      boatCoords: boatCoords({
        x: xScale(toMapLon(d.map_longitude)),
        y: yScale(d.map_latitude),
        r1: rScale(d.land_area),
        r2: eezRScale(d.eez_area),
        num_boats: boatScale(d.exports_value),
        maxBoats: MAX_BOATS,
        refArea: d.REF_AREA,
      }),
      islandsCoords: islandsCoords({
        x: xScale(toMapLon(d.map_longitude)),
        y: yScale(d.map_latitude),
        r1: rScale(d.land_area),
        r2: eezRScale(d.eez_area),
        num_islands: islandsScale(d.number_of_islands),
        seed: d.REF_AREA,
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
          const highlight =
            !selectedId || selectedId === d.REF_AREA ? 1 : 0.35;
          const boatPositions = d.boatCoords.map((b, i) => (
            <image 
              key={`boat-${d.REF_AREA}-${i}`}
              href={boat}
              width={7}
              transform={`translate(${b.x}, ${b.y}) rotate(${b.rotation + 90}) translate(-9, -20)`}
              style={{ pointerEvents: "none" }}
            />
          ));
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
            <motion.g
              key={`${d.REF_AREA}-eez`}
              initial={false}
              animate={{
                opacity: highlight,
                filter: `saturate(${highlight})`,
              }}
              transition={HIGHLIGHT_SPRING}
              style={{ pointerEvents: "none" }}
            >
              <circle className="eez"
                cx={d.x}
                cy={d.y}
                r={d.eez_r}
                fill="url(#eez-sea)"
              />
              {islandCircles}
              {boatPositions}
            </motion.g>
          );
        })}
        {points.map((d) => {
          const highlight =
            !selectedId || selectedId === d.REF_AREA ? 1 : 0.35;
          return (
          <motion.g
            key={`${d.REF_AREA}-land`}
            initial={false}
            animate={{
              opacity: highlight,
              filter: `saturate(${highlight})`,
            }}
            transition={HIGHLIGHT_SPRING}
          >
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
                r={d.r*0.6}
                fill={colors.tealLight}
                pointerEvents="none"
              />
            )}
          </motion.g>
          );
        })}
        {points.map((d) => (
          <text
            key={`label-${d.REF_AREA}`}
            x={d.x}
            y={d.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="pointer-events-none text-axis fill-navy"
            style={{ fontFamily: fontType.special }}
          >
            {d.REF_AREA}
          </text>
        ))}
      </svg>
      {hovered && (
        <CountryTooltip
          country={hovered.country}
          x={hovered.x}
          y={hovered.y}
          theme="light"
        />
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
