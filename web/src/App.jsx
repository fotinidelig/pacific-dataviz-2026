import { useState, useEffect, useCallback } from 'react'
import { ResponsiveLightIslandsSvg } from './LightIslandsSvg.jsx'
import { ResponsiveDarkIslandsSvg } from './DarkIslandsSvg.jsx'
import ThemeWipe from './ThemeWipe.jsx'
import InfoCard from './InfoCard.jsx'
import YearSlider from './YearSlider.jsx'
import {
  loadPdhClimateYear,
  loadTemperatureAnomalyDomain,
} from './LoadPDHData.jsx'
import { YEAR_MIN, YEAR_MAX } from './config.js'
import './App.css'

function App() {
  const [selected, setSelected] = useState(null)
  const [year, setYear] = useState(2020)
  const [pdhByArea, setPdhByArea] = useState(null)
  const [tempDomain, setTempDomain] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  const onSplitChange = useCallback((split) => {
    // Mostly dark (handle left of center) → lightRed frame glow.
    setDarkMode(split < 0.5)
  }, [])

  // Shared temp color domain — once (all years).
  useEffect(() => {
    let cancelled = false
    loadTemperatureAnomalyDomain()
      .then((domain) => {
        if (!cancelled) setTempDomain(domain)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setTempDomain(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Climate values for the selected year.
  useEffect(() => {
    let cancelled = false
    loadPdhClimateYear(year)
      .then((byArea) => {
        if (!cancelled) setPdhByArea(byArea)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setPdhByArea(null)
      })
    return () => {
      cancelled = true
    }
  }, [year])

  // Close the card when clicking outside it (island clicks still handled separately).
  useEffect(() => {
    if (!selected) return

    const onPointerDown = (event) => {
      if (event.target.closest?.('.info-card')) return
      if (event.target.closest?.('.year-slider')) return
      if (event.target.closest?.('.islands')) return
      if (event.target.closest?.('.theme-wipe__handle')) return
      setSelected(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [selected])

  return (
    <main className="relative h-screen w-screen">
      <div
        className={
          darkMode ? 'floating_content floating_content--dark' : 'floating_content'
        }
      >
        <ThemeWipe
          onSplitChange={onSplitChange}
          light={
            <ResponsiveLightIslandsSvg
              selectedId={selected?.REF_AREA ?? null}
              onSelectCountry={setSelected}
            />
          }
          dark={
            <div className="relative h-full w-full">
              <ResponsiveDarkIslandsSvg
                year={year}
                pdhByArea={pdhByArea}
                tempDomain={tempDomain}
              />
              <YearSlider
                year={year}
                onChange={setYear}
                min={YEAR_MIN}
                max={YEAR_MAX}
              />
            </div>
          }
        />
        {selected && (
          <InfoCard country={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </main>
  )
}

export default App
