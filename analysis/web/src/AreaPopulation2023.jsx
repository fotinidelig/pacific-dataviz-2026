import { useMemo } from "react";
import { ResponsiveScatterPlot } from "./ScatterPlot.jsx";
import data from "../../../data/processed/land_population.json";
import "./ScatterPlot.css";

export default function AreaPopulation2023({ excludeCountries = [] }) {
  const filteredData = useMemo(
    () => data.filter(([country]) => !excludeCountries.includes(country)),
    [excludeCountries],
  );

  return (
    <div className="area-population">
      <header className="app-header">
        <h1>Pacific islands: area and population</h1>
        <p>
          Bubble size encodes population; color encodes area (2023).
        </p>
      </header>

      <ResponsiveScatterPlot data={filteredData} />
    </div>
  );
}
