/**
 * Type definitions for EcoVig-IA climate observatory
 */

export type Layer = "anomaly" | "drought" | "fireRisk"

export type GlobeLayerDatum = {
  lat: number
  lon: number
  value: number
  region?: string
}

export type Selection = {
  lat: number
  lon: number
  name?: string
  value?: number
  region?: string // Added region field for context
}

export type YearInsight = {
  year: number
  layer: Layer
  selection?: Selection
  globalAvg: number
  changeVsBaseline: number
  percentile: number
  interpretation: string
  stats: {
    label: string
    value: string
    change?: string
  }[]
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type LayerConfig = {
  id: Layer
  label: string
  unit: string
  icon: string
  colorScale: { value: number; color: string }[]
  description: string
}
