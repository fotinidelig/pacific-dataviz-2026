import { useState, useEffect, useCallback, useMemo } from 'react'
import { ResponsiveLightIslandsSvg } from './LightIslandsSvg.jsx'
import { ResponsiveDarkIslandsSvg } from './DarkIslandsSvg.jsx'
import ThemeWipe from './ThemeWipe.jsx'
import InfoCard, { buildLightRows, buildDarkRows } from './InfoCard.jsx'
import InfoPanel from './InfoPanel.jsx'
import YearSlider from './YearSlider.jsx'
import {
  loadPdhClimateYear,
  loadTemperatureAnomalyDomain,
} from './LoadPDHData.jsx'
import { YEAR_MIN, YEAR_MAX } from './config.js'
import { colors } from './theme'
import './App.css'

function App() {
  const [selected, setSelected] = useState(null)
  /** 'light' | 'dark' — which map produced the current selection */
  const [selectedSource, setSelectedSource] = useState(null)
  const [year, setYear] = useState(2022)
  const [pdhByArea, setPdhByArea] = useState(null)
  const [tempDomain, setTempDomain] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  const onSplitChange = useCallback((split) => {
    setDarkMode(split < 0.5)
  }, [])

  const selectFromLight = useCallback((country) => {
    setSelected(country)
    setSelectedSource(country ? 'light' : null)
  }, [])

  const selectFromDark = useCallback((country) => {
    setSelected(country)
    setSelectedSource(country ? 'dark' : null)
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

  // Keep dark card climate fields in sync when the year changes.
  useEffect(() => {
    if (selectedSource !== 'dark' || !selected?.REF_AREA || !pdhByArea) return
    const climate = pdhByArea[selected.REF_AREA]
    if (!climate) return
    setSelected((prev) => {
      if (!prev) return prev
      if (
        prev.sla === climate.sla &&
        prev.ssta === climate.ssta &&
        prev.st_anom === climate.st_anom
      ) {
        return prev
      }
      return { ...prev, ...climate }
    })
  }, [year, pdhByArea, selectedSource, selected?.REF_AREA])

  // Close the card when clicking outside it (island clicks still handled separately).
  useEffect(() => {
    if (!selected) return

    const onPointerDown = (event) => {
      if (event.target.closest?.('.info-card')) return
      if (event.target.closest?.('.year-slider')) return
      if (event.target.closest?.('.islands')) return
      if (event.target.closest?.('.theme-wipe__handle')) return
      if (event.target.closest?.('.info-panel')) return
      if (event.target.closest?.('.info-panel__toggle')) return
      setSelected(null)
      setSelectedSource(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [selected])

  const cardProps = useMemo(() => {
    if (!selected || !selectedSource) return null
    if (selectedSource === 'dark') {
      return {
        title: selected.country,
        flagCode: selected.REF_AREA,
        rows: buildDarkRows(selected, year),
        accentColor: colors.darkRed,
        shadowColor: colors.lightRed,
      }
    }
    return {
      title: selected.country,
      flagCode: selected.REF_AREA,
      rows: buildLightRows(selected),
      accentColor: colors.teal,
      shadowColor: colors.tealLight,
    }
  }, [selected, selectedSource, year])

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
              selectedId={
                selectedSource === 'light' ? selected?.REF_AREA ?? null : null
              }
              onSelectCountry={selectFromLight}
            />
          }
          dark={
            <div className="relative h-full w-full">
              <ResponsiveDarkIslandsSvg
                year={year}
                pdhByArea={pdhByArea}
                tempDomain={tempDomain}
                selectedId={
                  selectedSource === 'dark' ? selected?.REF_AREA ?? null : null
                }
                onSelectCountry={selectFromDark}
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
        {cardProps && (
          <InfoCard {...cardProps} onClose={() => {
            setSelected(null)
            setSelectedSource(null)
          }} />
        )}
        <InfoPanel />
      </div>
    </main>
  )
}

export default App
