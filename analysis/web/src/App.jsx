import AreaPopulation2023 from "./AreaPopulation2023.jsx";
import { ResponsivePopulationTimeline } from "./PopulationTimeline.jsx";
import CountryFilterButtons from "./CountryFilterButtons.jsx";
import { useState } from "react";
import "./App.css";

export const emptySvg = () => {
  return (
    <svg width="50%" height="50%" fill="none" viewBox="0 0 24 24">
      <path d="M12 2L2 22h20L12 2z" fill="currentColor" />
    </svg>
  );
};

export default function App() {
  const [page, setPage] = useState(null);
  const [excludeCountries, setExcludeCountries] = useState([]);

  const toggleCountry = (country) => {
    setExcludeCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
  };

  return (
    <div className="app">
      <div className="page-buttons">
        <button
          onClick={() => setPage("area-population-2023")}
          className="relative inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-blue-600 p-0.5 text-sm font-medium text-black group focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          <span className="relative rounded-md bg-white px-4 py-2.5 transition-all duration-75 group-hover:bg-transparent">
            Area Population 2023
          </span>
        </button>
        <button
          onClick={() => setPage("population-timeline")}
          className="relative inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-blue-600 p-0.5 text-sm font-medium text-black group focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          <span className="relative rounded-md bg-white px-4 py-2.5 transition-all duration-75 group-hover:bg-transparent">
            Population Timeline
          </span>
        </button>
      </div>

      {(page === "population-timeline" || page === "area-population-2023") && (
        <CountryFilterButtons
          excludeCountries={excludeCountries}
          onToggle={toggleCountry}
        />
      )}

      <div className="page-content">
        {page === "area-population-2023" && (
          <AreaPopulation2023 excludeCountries={excludeCountries} />
        )}
        {page === "population-timeline" && (
          <ResponsivePopulationTimeline excludeCountries={excludeCountries} />
        )}
        {!page && emptySvg()}
      </div>
    </div>
  );
}
