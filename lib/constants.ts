/**
 * Constants for EcoVig-IA climate observatory
 */

import type { LayerConfig } from "./types"

export const MIN_YEAR = 1980
export const MAX_YEAR = 2035
export const BASELINE_PERIOD = "1991-2020"

export const LAYER_CONFIGS: Record<string, LayerConfig> = {
  anomaly: {
    id: "anomaly",
    label: "Anomalía Térmica",
    unit: "°C",
    icon: "🌡️",
    colorScale: [
      { value: -2, color: "#3b82f6" },
      { value: -1, color: "#60a5fa" },
      { value: 0, color: "#fbbf24" },
      { value: 2, color: "#f97316" },
      { value: 4, color: "#dc2626" },
    ],
    description: "Diferencia de temperatura respecto al período base 1991-2020",
  },
  drought: {
    id: "drought",
    label: "Índice de Sequía",
    unit: "índice 0-1",
    colorScale: [
      { value: 0, color: "#10b981" },
      { value: 0.3, color: "#fbbf24" },
      { value: 0.6, color: "#f97316" },
      { value: 0.9, color: "#dc2626" },
    ],
    icon: "💧",
    description: "Nivel de estrés hídrico en regiones afectadas",
  },
  fireRisk: {
    id: "fireRisk",
    label: "Riesgo de Incendio",
    unit: "bajo/medio/alto",
    colorScale: [
      { value: 0, color: "#10b981" },
      { value: 0.5, color: "#fbbf24" },
      { value: 1, color: "#dc2626" },
    ],
    icon: "🔥",
    description: "Probabilidad de incendios forestales",
  },
}

export const REFLECTIVE_PHRASES = [
  "Cada año que avanzas, el planeta retrocede un poco más.",
  "¿Qué pasaría si pudieras ver cómo tu planeta envejece contigo?",
  "El tiempo corre; la Tierra no se regenera tan rápido.",
  "Observa el cambio. Sé el cambio.",
]

// Cesium works without a token, just with some limitations on terrain/imagery
export const CESIUM_ION_TOKEN = ""
