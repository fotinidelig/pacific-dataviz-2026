import data from '../../../data/processed/population_pacific_all_years.json';
import countriesCodesColors from '../../../data/processed/countries-codes.json';
import { useMemo, useState, useRef, useCallback } from "react";
import { useDimensions } from './use-dimensions';
import { AxisBottom } from './AxisBottom';
import { AxisLeft } from './AxisLeft';
import { Cursor } from './Cursor';
import { buildCursorLabelShort } from './formatCursorLabel';
import * as d3 from 'd3';

const countryColorMap = Object.fromEntries(
  countriesCodesColors.map(({ country, color }) => [country, color]),
);

export default function PopulationTimeline({ width, height, popData, startYear, endYear, excludeCountries = [] }) {
    const filteredData = useMemo(() => {
        return popData.filter(d => d.Year >= startYear && d.Year <= endYear && !excludeCountries.includes(d.Entity));
    }, [popData, startYear, endYear, excludeCountries]);

    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [cursorPosition, setCursorPosition] = useState(null);

    const [xMin, xMax] = d3.extent(filteredData, (d) => d.Year);
    const margin = { top: 44, right: 120, bottom: 52, left: 64 };
    const innerWidth = Math.max(0, (width ?? 0) - margin.left - margin.right);
    const innerHeight = Math.max(0, (height ?? 0) - margin.top - margin.bottom);

    const maxPopulation = d3.max(filteredData, (d) => d.Population);

    const xScale = useMemo(() => {
        return d3
        .scaleLinear()
        .domain([xMin || 0, xMax || 0])
        .range([0, innerWidth]);
    }, [xMin, xMax, innerWidth]);

    const yScale = useMemo(
        () => d3.scaleLinear().domain([0, maxPopulation || 0]).range([innerHeight, 0]).nice(),
        [maxPopulation, innerHeight],
    );

    const presentCountries = useMemo(() => {
        return [...new Set(filteredData.map((d) => d.Entity))];
    }, [filteredData]);

    const dataByCountry = useMemo(() => {
        const map = new Map();
        for (const country of presentCountries) {
            map.set(
                country,
                filteredData
                    .filter((d) => d.Entity === country)
                    .sort((a, b) => a.Year - b.Year),
            );
        }
        return map;
    }, [filteredData, presentCountries]);

    const labelY = useMemo(() => {
        return presentCountries.map(country => {
            const population = filteredData.find(d => d.Entity === country && d.Year === endYear)?.Population;
            if (!population) return null;
            return {country, y: yScale(population)};
        });
    }, [filteredData, yScale, endYear, presentCountries]);

    const lines = useMemo(() => {
        return presentCountries.map((country) => {
            const countryData = dataByCountry.get(country) ?? [];
            const lineBuilder = d3
                .line()
                .x((d) => xScale(d.Year))
                .y((d) => yScale(d.Population));
            return {
                country,
                path: lineBuilder(countryData),
                color: countryColorMap[country],
            };
        });
    }, [presentCountries, dataByCountry, xScale, yScale]);

    const onMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursorPosition(e.clientX - rect.left);
    }, []);

    const onMouseLeave = useCallback(() => {
        setCursorPosition(null);
        setHoveredCountry(null);
    }, []);

    const cursorSnap = useMemo(() => {
        if (cursorPosition == null || !hoveredCountry) return null;

        const rows = dataByCountry.get(hoveredCountry);
        if (!rows?.length) return null;

        const year = xScale.invert(cursorPosition);
        const i = d3.bisector((d) => d.Year).center(rows, year);
        const closest = rows[Math.max(0, Math.min(i, rows.length - 1))];
        const value = Number(closest.Population) || 0;

        return {
            x: xScale(closest.Year),
            y: yScale(value),
            label: buildCursorLabelShort(closest.Year, value, hoveredCountry),
            color: countryColorMap[hoveredCountry] ?? "#737270",
        };
    }, [cursorPosition, hoveredCountry, dataByCountry, xScale, yScale]);

    return (
    <svg width="100%" height="100%" overflow={'visible'}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
            <g transform={`translate(0, ${innerHeight})`}>
                <AxisBottom
                    xScale={xScale}
                    pixelsPerTick={50}
                    innerHeight={innerHeight}
                    label="Year"
                />
            </g>
            <AxisLeft
                yScale={yScale}
                pixelsPerTick={50}
                innerWidth={innerWidth}
                label="Population"
            />

            <g onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
                <rect
                    x={0}
                    y={0}
                    width={innerWidth}
                    height={innerHeight}
                    visibility="hidden"
                    pointerEvents="all"
                />
                {lines.map(line => (
                    <g
                        key={line.country}
                        onMouseEnter={() => setHoveredCountry(line.country)}
                    >
                        <path
                            d={line.path}
                            fill="none"
                            strokeWidth={8}
                            stroke="white"
                            opacity={0.1}
                            pointerEvents="stroke"
                        />
                        <path
                            d={line.path}
                            fill="none"
                            strokeWidth={3}
                            stroke={line.color}
                            opacity={
                                hoveredCountry === line.country
                                    ? 1
                                    : !hoveredCountry
                                      ? 0.8
                                      : 0.5
                            }
                            pointerEvents="none"
                        />
                    </g>
                ))}
                {hoveredCountry && (
                    <text
                        x={xScale(endYear + 0.5)}
                        y={labelY.find(l => l?.country === hoveredCountry)?.y}
                        textAnchor="start"
                        dy="0.35em"
                        fill="black"
                        stroke="#ffffff"
                        strokeWidth={3}
                        paintOrder="stroke"
                        style={{ fontSize: 12, fontWeight: 600 }}
                        pointerEvents="none"
                    >
                        {hoveredCountry}
                    </text>
                )}
                {cursorSnap != null && (
                    <Cursor
                        height={innerHeight}
                        x={cursorSnap.x}
                        y={cursorSnap.y}
                        circle
                        label={cursorSnap.label}
                        countryColors={countryColorMap}
                        color={cursorSnap.color}
                    />
                )}
            </g>
        </g>
    </svg>);
}

export const ResponsivePopulationTimeline = ({ startYear = 1950, endYear = 2023, excludeCountries = [] }) => {
    const containerRef = useRef(null);
    const { width, height } = useDimensions(containerRef);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "24rem" }}>
            <PopulationTimeline
                width={width}
                height={height}
                popData={data}
                startYear={startYear}
                endYear={endYear}
                excludeCountries={excludeCountries}
            />
        </div>
    );
};
