import { useMemo, useState } from "react";
import ScatterPlot from "./ScatterPlot.jsx";
import data from "../../data/processed/land_population.json";

export default function App() {
  const countries = useMemo(() => {
    const byCode = new Map();
    for (const row of data) {
      const [country, , , code] = row;
      if (!byCode.has(code)) byCode.set(code, country);
    }
    return Array.from(byCode.entries())
      .map(([code, country]) => ({ code, country }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, []);

  const [selectedCode, setSelectedCode] = useState("");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pacific islands: land and population</h1>
        <p>
          Bubble size encodes population; color encodes land cover (2023).
        </p>
      </header>
      <div className="controls">
        <label className="controls-label" htmlFor="country-select">
          Highlight country
        </label>
        <select
          id="country-select"
          className="controls-select"
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
        >
          <option value="">None</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.country}
            </option>
          ))}
        </select>
      </div>

      <ScatterPlot data={data} selectedCode={selectedCode || null} />
    </div>
  );
}
