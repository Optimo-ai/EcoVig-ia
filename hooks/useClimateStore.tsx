/**
 * Global state management for climate observatory using React Context
 * Manages year, layer, playback, and data fetching
 */

"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { GlobeLayerDatum, Layer, Selection } from "@/lib/types"
import { getLayerData } from "@/lib/mockApi"
import { MIN_YEAR, MAX_YEAR } from "@/lib/constants"

type PlaybackSpeed = 1 | 2 | 4

type ClimateState = {
  // Year control
  year: number
  minYear: number
  maxYear: number
  setYear: (year: number) => void

  // Layer control
  layer: Layer
  setLayer: (layer: Layer) => void

  // Playback control
  isPlaying: boolean
  speed: PlaybackSpeed
  play: () => void
  pause: () => void
  step: (direction: 1 | -1) => void
  setSpeed: (speed: PlaybackSpeed) => void

  // Data
  data: GlobeLayerDatum[]
  loading: boolean
  fetchData: (year: number, layer: Layer) => Promise<void>

  // Selection
  selection?: Selection
  setSelection: (selection?: Selection) => void
}

const ClimateContext = createContext<ClimateState | undefined>(undefined)

export function ClimateProvider({ children }: { children: ReactNode }) {
  const [year, setYearState] = useState(2000)
  const [layer, setLayerState] = useState<Layer>("anomaly")
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [data, setData] = useState<GlobeLayerDatum[]>([])
  const [loading, setLoading] = useState(false)
  const [selection, setSelection] = useState<Selection | undefined>()

  const fetchData = useCallback(async (year: number, layer: Layer) => {
    setLoading(true)
    try {
      const data = await getLayerData(year, layer)
      setData(data)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Failed to fetch climate data:", error)
      setLoading(false)
    }
  }, [])

  const setYear = useCallback(
    (newYear: number) => {
      const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, newYear))
      setYearState(clamped)
      fetchData(clamped, layer)
    },
    [layer, fetchData],
  )

  const setLayer = useCallback(
    (newLayer: Layer) => {
      setLayerState(newLayer)
      fetchData(year, newLayer)
    },
    [year, fetchData],
  )

  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])

  const step = useCallback(
    (direction: 1 | -1) => {
      const newYear = year + direction
      if (newYear >= MIN_YEAR && newYear <= MAX_YEAR) {
        setYear(newYear)
      } else if (direction > 0) {
        setYear(MIN_YEAR)
      }
    },
    [year, setYear],
  )

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      step(1)
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed, step])

  const value: ClimateState = {
    year,
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
    setYear,
    layer,
    setLayer,
    isPlaying,
    speed,
    play,
    pause,
    step,
    setSpeed,
    data,
    loading,
    fetchData,
    selection,
    setSelection,
  }

  return <ClimateContext.Provider value={value}>{children}</ClimateContext.Provider>
}

export function useClimateStore() {
  const context = useContext(ClimateContext)
  if (!context) {
    throw new Error("useClimateStore must be used within ClimateProvider")
  }
  return context
}
