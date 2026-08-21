import { useEffect, useState, useRef, useMemo } from "react";
import { useDimensions } from "./use-dimensions.jsx";
import { scaleLinear, scaleSqrt, scaleLog } from "d3-scale";
import { interpolateRgb } from "d3-interpolate";
import { extent, max } from "d3-array";
import { csvParse } from "d3-dsv";
import { colors } from "./theme";
import { motion, AnimatePresence } from "motion/react";
import { fontType } from "./theme/typography.js";
import {
  MAP_MARGIN,
  BUBBLE_MIN_R,
  BUBBLE_MAX_R,
  EEZ_MIN_R,
  EEZ_MAX_R,
  SLA_RING_GAP,
  MAX_ISLANDS,
} from "./config.js";
import { islandsCoords } from "./islandsCoords.js";
import CountryTooltip from "./CountryTooltip.jsx";
import MapTitle from "./MapTitle.jsx";
import StoryCard from "./StoryCard.jsx";
import storyPointsData from "./assets/story_points.json";

const HIGHLIGHT_SPRING = { type: "spring", stiffness: 160, damping: 24, mass: 0.7 };
const ENTRANCE_STAGGER = 0.05;
const ENTRANCE_DURATION = 0.85;
const STORY_POINTS = storyPointsData.storyPoints;

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
    // Negative: rings outside the island (outer → inner).
    // Positive: rings inside the island (inner → outer).
    radii.push(sla < 0 ? islandR + i * SLA_RING_GAP : islandR - i * SLA_RING_GAP);
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
  selectedId = null,
  onSelectCountry,
}) {
  const [data, setData] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [intro, setIntro] = useState(true);
  const [storyOpen, setStoryOpen] = useState(true);

  const activeStory = useMemo(
    () => STORY_POINTS.find((p) => p.year === year) ?? null,
    [year],
  );

  // Re-show the card whenever the slider year changes (× only hides until then)
  useEffect(() => {
    setStoryOpen(true);
  }, [year]);

  const showStory = activeStory != null && storyOpen;

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
    const [d0, d1] = tempDomain;
    // Diverging around 0: cool ← sand → warm (symmetric extent so ± map evenly).
    const extent = Math.max(Math.abs(d0), Math.abs(d1));
    return scaleLinear()
      .domain([-extent, 0, extent])
      .range([colors.tealLight, colors.teal, colors.darkRed])
      .interpolate(interpolateRgb)
      .clamp(true);
  }, [tempDomain]);

  const layout = useMemo(() => {
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

    const islandsExtent = extent(
      data.filter((d) => d.number_of_islands != null && d.number_of_islands > 0),
      (d) => d.number_of_islands,
    );
    const islandsScale = scaleLog()
      .domain(islandsExtent)
      .range([0, MAX_ISLANDS]);

    // Layout + island dots only — not climate (year changes must not reshuffle dots).
    return data.map((d) => {
      const r = rScale(d.land_area);
      const eez_r = eezRScale(d.eez_area);
      const x = xScale(toMapLon(d.map_longitude));
      const y = yScale(d.map_latitude);
      const numIslands =
        d.number_of_islands != null && d.number_of_islands > 0
          ? Math.round(islandsScale(d.number_of_islands))
          : 0;
      return {
        ...d,
        x,
        y,
        r,
        eez_r,
        islandsCoords: islandsCoords({
          x,
          y,
          r1: r,
          r2: eez_r,
          num_islands: numIslands,
          seed: d.REF_AREA,
        }),
      };
    });
  }, [data, width, height]);

  const points = useMemo(() => {
    if (!layout || !tempColor) return null;

    return layout.map((d) => {
      const climate = pdhByArea?.[d.REF_AREA] ?? {
        sla: null,
        ssta: null,
        st_anom: null,
      };
      return {
        ...d,
        ...climate,
        fill:
          climate.st_anom != null
            ? tempColor(climate.st_anom)
            : colors.sand,
        sstaColor:
          climate.ssta != null ? tempColor(climate.ssta) : null,
        slaRadii: slaRingRadii(d.r, climate.sla),
      };
    });
  }, [layout, pdhByArea, tempColor]);

  useEffect(() => {
    if (!points?.length) return;
    const ms = (points.length * ENTRANCE_STAGGER + ENTRANCE_DURATION) * 1000;
    const id = setTimeout(() => setIntro(false), ms);
    return () => clearTimeout(id);
  }, [points]);

  if (!points) return null;

  return (
    <div className="relative h-full w-full" style={{ backgroundColor: colors.sand }}>
      <MapTitle
        dark
        title="a picture of the pacific islands"
        subtitle="...the climate as they face it."
      />
      <AnimatePresence mode="wait">
        {showStory && (
          <StoryCard
            key={activeStory.year}
            dark
            onClose={() => setStoryOpen(false)}
          >
            <p>{activeStory.description}</p>
          </StoryCard>
        )}
      </AnimatePresence>
      <svg width={width} height={height} className="bubbles-dark">
        <defs>
          <filter id="eez-wave-glow-dark" x="-40%" y="-50%" width="180%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.75" />
          </filter>
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

        {[...points]
          .sort((a, b) => b.eez_r - a.eez_r)
          .map((d, i) => {
          const highlight =
            !selectedId || selectedId === d.REF_AREA ? 1 : 0.35;
          return (
            <motion.g
              key={d.REF_AREA}
              initial={{ opacity: 0 }}
              animate={{
                opacity: highlight,
                filter: `saturate(${highlight})`,
              }}
              transition={
                intro
                  ? {
                      duration: ENTRANCE_DURATION,
                      ease: "easeOut",
                      delay: i * ENTRANCE_STAGGER,
                    }
                  : HIGHLIGHT_SPRING
              }
            >
              {d.sstaColor && (
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={d.eez_r}
                  fill={`url(#ssta-grad-${d.REF_AREA})`}
                  style={{ pointerEvents: "none" }}
                />
              )}
              {[0, 1, 2].map((wave) => {
                const countryDelay = i * 0.35;
                return (
                  <motion.circle
                    key={`eez-wave-${d.REF_AREA}-${wave}`}
                    className="eez-wave"
                    cx={d.x}
                    cy={d.y}
                    fill="none"
                    stroke={d.sstaColor ?? colors.tealLight}
                    filter="url(#eez-wave-glow-dark)"
                    initial={{ r: d.r, opacity: 0, strokeWidth: 2 }}
                    animate={{
                      r: [d.r, d.r, d.eez_r * 0.9],
                      opacity: [0, 0.5, 0],
                      strokeWidth: [2, 2, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      ease: "easeOut",
                      times: [0, 0.12, 1],
                      repeat: Infinity,
                      repeatDelay: 0.3,
                      delay: countryDelay + wave * 0.8,
                    }}
                    style={{ pointerEvents: "none" }}
                  />
                );
              })}
              {d.islandsCoords.map((c) => (
                <circle
                  className="eez-islands"
                  key={`islands-${d.REF_AREA}-${c.x}-${c.y}`}
                  cx={c.x}
                  cy={c.y}
                  r={3}
                  fill={colors.sand}
                  stroke="white"
                  strokeWidth={0.5}
                  style={{ pointerEvents: "none" }}
                />
              ))}
              <circle
                className="islands"
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill={d.fill}
                fillOpacity={0.95}
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
                style={{ fontFamily: fontType.special }}
              >
                {d.REF_AREA}
              </text>
            </motion.g>
          );
        })}
      </svg>
      {hovered && (
        <CountryTooltip
          country={hovered.country}
          x={hovered.x}
          y={hovered.y}
          theme="dark"
        />
      )}
    </div>
  );
}

export function ResponsiveDarkIslandsSvg({
  year,
  pdhByArea,
  tempDomain,
  selectedId = null,
  onSelectCountry,
}) {
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
        selectedId={selectedId}
        onSelectCountry={onSelectCountry}
      />
    </div>
  );
}
