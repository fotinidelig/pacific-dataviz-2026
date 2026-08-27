import { useState, useEffect } from "react";
import { motion } from "motion/react";
import "./InfoPanel.css";
import { colors } from "./theme";
import boat from "./assets/boat_blue.svg";
import { LEGEND_NOTES_SPACE } from "./config";

const SOURCE_ROWS = [
  {
    source: "Pacific Data Hub",
    attribute: "Land area (2023)",
    href: "https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_LAND_USE&df[ag]=SPC&df[vs]=1.0&dq=A..&pd=2016,&to[TIME_PERIOD]=false",
  },
  {
    source: "pacificdata.org",
    attribute: "EEZ area (2022)",
    href: "https://pacificdata.org/data/dataset/pacific-island-region-spatial-data48d9036d-04cb-4cb0-8aa8-b16197985b6a",
  },
  {
    source: "worldometers.info",
    attribute: "Population (2024)",
    href: "https://www.worldometers.info/world-population/population-by-country/",
  },
  {
    source: "OEC",
    attribute: "Exports (2024)",
    href: "https://oec.world/en",
  },
  {
    source: "Pacific Data Hub",
    attribute: "Sea level anomaly",
    href: "https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SEA_LVL.&pd=,&to[TIME_PERIOD]=false",
  },
  {
    source: "Pacific Data Hub",
    attribute: "Sea surface temperature",
    href: "https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SST_ANOM.&pd=,&to[TIME_PERIOD]=false",
  },
  {
    source: "Pacific Data Hub",
    attribute: "Surface temperature & sea level",
    href: "https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.ST_ANOM.&pd=,&to[TIME_PERIOD]=false",
  },
  {
    source: "Approximate data based on wikipedia",
    attribute: "Island count data",
    href: null,
  },
];

const BREATH_SPRING = {
  type: "spring",
  stiffness: 50,
  damping: 12,
  mass: 1,
  repeat: Infinity,
  repeatType: "mirror",
};

function LightLegend() {
  return (
    <section className="legend-light info-panel__section" aria-label="Socioeconomic map">
      <h2 className="info-panel__section-title">How to read the visuals</h2>
      <svg
        className="legend-light__figure"
        viewBox="0 35 295 120"
        width="100%"
        role="img"
        aria-label="Country bubble with exclusive economic zone and atoll"
      >
        <defs>
          <radialGradient id="legend-eez">
            <stop offset="0%" stopColor={colors.blue} stopOpacity={0.8} />
            <stop offset="45%" stopColor={colors.teal} stopOpacity={0.65} />
            <stop offset="75%" stopColor={colors.tealLight} stopOpacity={0.5} />
            <stop offset="100%" stopColor={colors.tealLight} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform="translate(30, -10)">
          <circle cx="100" cy="100" r="53" fill="url(#legend-eez)" />
          <circle cx="100" cy="100" r="22" fill={colors.blue} fillOpacity="0.85" />
          <circle className="atolls" cx="94" cy="100" r="12" fill={colors.tealLight} />
          <circle cx="130" cy="100" r="2" fill={colors.sand} />
          <circle cx="122" cy="120" r="2" fill={colors.sand} />
          <circle cx="110" cy="125" r="2" fill={colors.sand} />
          <image href={boat} width={4} transform="translate(62, 77) rotate(-45) " />
          <image href={boat} width={4} transform="translate(75, 59) rotate(-30) " />
          <g className="legend-light__notes" fill={colors.navy} stroke={colors.navy}>
            <line x1="113" y1="90" x2="127" y2="80" strokeWidth="0.75" fill="none" />
            <line x1="127" y1="80" x2="165" y2="80" strokeWidth="0.75" fill="none" />
            <text className="bolds" x="127" y={80 + LEGEND_NOTES_SPACE} stroke="none">
              country
            </text>
            <line x1="108" y1="65" x2="123" y2="50" strokeWidth="0.75" fill="none" />
            <line x1="123" y1="50" x2="247" y2="50" strokeWidth="0.75" fill="none" />
            <text className="bolds" textAnchor="end" x="247" y={50 + LEGEND_NOTES_SPACE} stroke="none">
              exclusive economic zone
            </text>
            <text textAnchor="end" x="247" y={50 + 2 * LEGEND_NOTES_SPACE} stroke="none">
              {" ("}
              <a
                href="https://en.wikipedia.org/wiki/Exclusive_economic_zone"
                target="_blank"
                rel="noopener noreferrer"
              >
                <tspan fill={colors.blue} textDecoration="underline">
                  eez
                </tspan>
              </a>
              )
            </text>
            <line x1="92" y1="110" x2="72" y2="130" strokeWidth="0.75" fill="none" />
            <line x1="72" y1="130" x2="22" y2="130" strokeWidth="0.75" fill="none" />
            <text textAnchor="start" x="22" y={130 + LEGEND_NOTES_SPACE} stroke="none">
              inner hole =
            </text>
            <text textAnchor="start" x="22" y={130 + 2 * LEGEND_NOTES_SPACE} stroke="none">
              country has
            </text>
            <text textAnchor="start" x="22" y={130 + 3 * LEGEND_NOTES_SPACE} stroke="none">
              <a href="https://en.wikipedia.org/wiki/Atoll" target="_blank" rel="noopener noreferrer">
                <tspan fill={colors.blue} textDecoration="underline">
                  atolls
                </tspan>
              </a>
            </text>
            <line x1="124" y1="120" x2="225" y2="120" strokeWidth="0.75" fill="none" />
            <text className="bolds" textAnchor="end" x="225" y={120 + LEGEND_NOTES_SPACE} stroke="none">
              country's islands
            </text>
            <text textAnchor="end" x="225" y={125 + 2 * LEGEND_NOTES_SPACE} stroke="none">
              1 bubble ~ 3 islands
            </text>
            <text textAnchor="end" x="225" y={125 + 3 * LEGEND_NOTES_SPACE} stroke="none">
              6 bubbles ~ 1K islands
            </text>
            <line x1="63" y1="80" x2="-13" y2="80" strokeWidth="0.75" fill="none" />
            <text className="bolds" textAnchor="start" x="-13" y={80 + LEGEND_NOTES_SPACE} stroke="none">
              exports in $
            </text>
            <text textAnchor="start" x="-13" y={85 + 2 * LEGEND_NOTES_SPACE} stroke="none">
              1 boat ~ 0.3M $
            </text>
            <text textAnchor="start" x="-13" y={85 + 3 * LEGEND_NOTES_SPACE} stroke="none">
              6 boats ~ 14B $
            </text>
          </g>
        </g>
      </svg>
      <svg
        className="legend-light__notes"
        viewBox="0 20 280 70"
        width="100%"
        role="img"
        aria-label="Land area and population encodings"
      >
        <g transform="translate(40, 78)" fill={colors.navy} stroke={colors.navy}>
          {[22, 13, 8].map((r) => (
            <circle
              key={r}
              cx={0}
              cy={-r}
              r={r}
              fill="none"
              stroke={colors.navy}
              strokeWidth="0.8"
            />
          ))}
          <line x1={0} y1={-44} x2={91} y2={-44} stroke={colors.navy} strokeWidth="0.8" />
          <text textAnchor="end" x={91} y={-44 + LEGEND_NOTES_SPACE} stroke="none">
            larger bubble =
          </text>
          <text textAnchor="end" x={91} y={-44 + 2 * LEGEND_NOTES_SPACE} stroke="none">
            larger land area
          </text>
          <text textAnchor="end" x={91} y={-44 + 3 * LEGEND_NOTES_SPACE} stroke="none">
            in km²
          </text>
        </g>
        <g transform="translate(240, 78)" fill={colors.navy} stroke={colors.navy}>
          <defs>
            <linearGradient id="legend-population" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor={colors.sand} stopOpacity={1} />
              <stop offset="100%" stopColor={colors.blue} stopOpacity={1} />
            </linearGradient>
          </defs>
          <circle cx={0} cy={-22} r={22} stroke="none" fill="url(#legend-population)" />
          <line x1={0} y1={0} x2={-90} y2={0} stroke={colors.navy} strokeWidth="0.8" />
          <text textAnchor="start" x={-90} y={-3 - LEGEND_NOTES_SPACE} stroke="none">
            darker color =
          </text>
          <text textAnchor="start" x={-90} y={-3} stroke="none">
            larger population
          </text>
        </g>
      </svg>
      <p className="legend-example">
        E.g. Papua New Guinea has 600 islands, almost $14B exports, and is much larger than
        Pitcairn Islands in area as well as population.
      </p>
    </section>
  );
}

function DarkLegend() {
  return (
    <section className="legend-dark legend-dark__notes info-panel__section" aria-label="Climate map">
      <h2 className="info-panel__section-title">How to read the visuals</h2>
      <svg
        className="legend-dark__figure"
        viewBox="-15 -19 300 150"
        width="100%"
        role="img"
        aria-label="Climate encodings: temperature and sea level"
      >
        <defs>
          <linearGradient id="temperature" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={colors.darkRed} stopOpacity={0.9} />
            <stop offset="50%" stopColor={colors.teal} stopOpacity={0.65} />
            <stop offset="100%" stopColor={colors.tealLight} stopOpacity={0} />
          </linearGradient>
          <radialGradient id="legend-eez-dark">
            <stop offset="0%" stopColor={colors.darkRed} stopOpacity={0.85} />
            <stop offset="45%" stopColor={colors.darkRed} stopOpacity={0.45} />
            <stop offset="100%" stopColor={colors.darkRed} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform="translate(20, -10)" fill={colors.navy} stroke={colors.navy}>
          <circle cx="100" cy="60" r="50" fill="url(#legend-eez-dark)" stroke="none" />
          <circle cx="100" cy="60" r="22" fill={colors.darkRed} stroke="none" />
          <circle cx="100" cy="60" r="18" fill="none" stroke={colors.mustard} strokeWidth="1.75" />
          <circle cx="100" cy="60" r="26" fill="none" stroke={colors.mustard} strokeWidth="1.75" />
          <circle cx="135" cy="60" r="2" fill={colors.sand} stroke="none" />
          <circle cx="127" cy="80" r="2" fill={colors.sand} stroke="none" />
          <circle cx="113" cy="90" r="2" fill={colors.sand} stroke="none" />
          <line x1="90" y1="60" x2="52" y2="32" stroke={colors.navy} strokeWidth="0.8" />
          <line x1="75" y1="40" x2="52" y2="32" stroke={colors.navy} strokeWidth="0.8" />
          <line x1="52" y1="32" x2="-11" y2="32" stroke={colors.navy} strokeWidth="0.8" />
          <text className="bolds" textAnchor="start" x="-11" y={32 + LEGEND_NOTES_SPACE} stroke="none">
            surface & sea
          </text>
          <text className="bolds" textAnchor="start" x="-11" y={32 + 2 * LEGEND_NOTES_SPACE} stroke="none">
            temperature
          </text>
          <text textAnchor="start" x="-11" y={32 + 3 * LEGEND_NOTES_SPACE} stroke="none">
            anomalies
          </text>
          <circle cx="84" cy="69" r="2" fill={colors.mustard} stroke="none" />
          <line x1="84" y1="69" x2="75" y2="80" stroke={colors.navy} strokeWidth="0.8" />
          <circle cx="100" cy="86" r="2" fill={colors.mustard} stroke="none" />
          <line x1="100" y1="86" x2="75" y2="80" stroke={colors.navy} strokeWidth="0.8" />
          <line x1="75" y1="80" x2="-20" y2="80" stroke={colors.navy} strokeWidth="0.8" />
          <text className="bolds" textAnchor="start" x="-20" y={80 + LEGEND_NOTES_SPACE} stroke="none">
            sea level anomaly
          </text>
          <text textAnchor="start" x="-20" y={85 + 2 * LEGEND_NOTES_SPACE} stroke="none">
            each line = 1cm
          </text>
          <text textAnchor="start" x="-20" y={85 + 3 * LEGEND_NOTES_SPACE} stroke="none">
            inner circles = rise
          </text>
          <text textAnchor="start" x="-20" y={85 + 4 * LEGEND_NOTES_SPACE} stroke="none">
            outer circles = fall
          </text>
        </g>
        <g transform="translate(140, -10)" fill={colors.navy} stroke={colors.navy}>
          <circle
            cx="100"
            cy="60"
            r="22"
            fill="url(#temperature)"
            stroke={colors.darkRed}
            strokeWidth="0.1"
          />
          <text textAnchor="end" x="110" y={38 - 3} stroke="none">
            1.2°C
          </text>
          <text textAnchor="end" x="110" y={60} stroke="none">
            0°C
          </text>
          <text textAnchor="end" x="110" y={82 + LEGEND_NOTES_SPACE} stroke="none">
            -1.1 °C
          </text>
          <line x1="70" y1="100" x2="130" y2="100" stroke={colors.navy} strokeWidth="0.8" />
          <text textAnchor="middle" x="100" y={100 + LEGEND_NOTES_SPACE} stroke="none">
            color shows
          </text>
          <text textAnchor="middle" x="100" y={100 + 2 * LEGEND_NOTES_SPACE} stroke="none">
            temperature
          </text>
        </g>
      </svg>
      <p className="legend-example">
        E.g. Fiji Islands experienced 1.1 °C increased temperature on land and sea compared to its
        baseline in 2022. Its sea level rose 2cm too.
      </p>
    </section>
  );
}

export default function InfoPanel({ dark = false }) {
  // null | "legend" | "sources" — what should be open (null = closing / closed)
  const [panel, setPanel] = useState(null);
  // Keep last content mounted until the slide-out transition finishes
  const [displayed, setDisplayed] = useState(null);
  // First auto-open uses a slower slide; user toggles keep the normal speed
  const [introOpen, setIntroOpen] = useState(false);

  const open = panel != null;

  const closePanel = () => {
    setIntroOpen(false);
    setPanel(null);
  };

  const togglePanel = (next) => {
    setIntroOpen(false);
    setPanel((current) => (current === next ? null : next));
  };

  // Sync body content when opening / switching; keep it while closing
  useEffect(() => {
    if (panel != null) setDisplayed(panel);
  }, [panel]);

  // After mount (maps/story have time to settle), slide the legend in slowly
  useEffect(() => {
    const id = setTimeout(() => {
      setIntroOpen(true);
      setPanel("legend");
    }, 2200);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (event.target.closest?.(".info-panel")) return;
      if (event.target.closest?.(".info-panel__toggles")) return;
      closePanel();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const darkToggle = dark ? " info-panel__toggle--dark" : "";
  // While closing, panel is null but displayed still holds "legend" | "sources"
  const contentKind = panel ?? displayed;

  return (
    <>
      <div className="info-panel__toggles" style={{ zIndex: open ? 0 : 30 }}>
        <motion.button
          type="button"
          className={`info-panel__toggle info-panel__toggle--legend${darkToggle}`}
          aria-label={panel === "legend" ? "Close legend" : "How to read the visuals"}
          aria-expanded={panel === "legend"}
          onClick={() => togglePanel("legend")}
          whileHover={{
            scale: 1.08,
            transition: { type: "spring", stiffness: 320, damping: 18 },
          }}
        >
          guide
        </motion.button>

        <motion.button
          type="button"
          className={`info-panel__toggle info-panel__toggle--sources${darkToggle}`}
          aria-label={panel === "sources" ? "Close sources" : "Open sources"}
          aria-expanded={panel === "sources"}
          onClick={() => togglePanel("sources")}
          initial={{ scale: 1 }}
          whileHover={{
            scale: 1.15,
            transition: { type: "spring", stiffness: 320, damping: 18 },
          }}
        >
          <span className="info-panel__toggle-icon" aria-hidden="true" />
        </motion.button>
      </div>

      <aside
        className={[
          "info-panel",
          open ? "info-panel--open" : "",
          introOpen ? "info-panel--intro" : "",
          dark ? "info-panel--dark" : "",
          contentKind === "legend" ? "info-panel--legend" : "",
          contentKind === "sources" ? "info-panel--sources" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!open}
        onTransitionEnd={(event) => {
          // Only clear content after the slide-out finishes
          if (event.propertyName !== "transform") return;
          if (event.target !== event.currentTarget) return;
          if (!open) setDisplayed(null);
        }}
      >
        <header className="info-panel__header">
          <button
            type="button"
            className="info-panel__close"
            aria-label="Close"
            onClick={closePanel}
          >
            ×
          </button>
        </header>

        <div className="info-panel__body">
          {contentKind === "legend" && (dark ? <DarkLegend /> : <LightLegend />)}
          {contentKind === "sources" && (
            <section className="info-panel__section" aria-label="Data sources">
              <h2 className="info-panel__section-title">Data Sources</h2>
              <ul className="info-panel__sources">
                {SOURCE_ROWS.map(({ source, attribute, href }) => (
                  <li key={attribute} className="info-panel__source-row">
                    <span className="info-panel__source-attr">{attribute}</span>
                    <span className="info-panel__source-name">
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {source}
                        </a>
                      ) : (
                        source
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {contentKind === "sources" && (
          <footer className="info-panel__credits">
            <p>© Fotini Deligiannaki. All rights reserved.</p>
            <p>
              <a
                href="https://github.com/fotinidelig/pacific-dataviz-2026"
                target="_blank"
                rel="noopener noreferrer"
              >
                Project repository
              </a>
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}
