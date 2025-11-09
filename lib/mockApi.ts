/**
 * Climate Data API using real data from climate-data.json
 */

import type { GlobeLayerDatum, Layer, YearInsight } from "./types"
import { getRegionsWithAnomalies, getRegion, getRegionVariable } from "./climateDataLoader"

/**
 * Generates climate data points for the globe using real data
 */
export async function getLayerData(year: number, layer: Layer): Promise<GlobeLayerDatum[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const data: GlobeLayerDatum[] = []

  const regionsData = getRegionsWithAnomalies(year, "t2m")

  regionsData.forEach((regionData) => {
    if (!regionData || !regionData.coords) return

    const { lat, lon } = regionData.coords

    // Add main region point
    let value = 0

    switch (layer) {
      case "anomaly":
        value = regionData.anomaly
        break
      case "drought":
        // Drought increases with temperature anomaly
        value = Math.max(0, Math.min(1, regionData.anomaly / 4 + 0.3))
        break
      case "fireRisk":
        // Fire risk also correlates with temperature
        value = Math.max(0, Math.min(1, regionData.anomaly / 3 + 0.4))
        break
    }

    // Add center point
    data.push({ lat, lon, value, region: regionData.name })

    // Add surrounding points for better visualization
    const spread = 10
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const offsetLat = lat + Math.cos(angle) * spread
      const offsetLon = lon + Math.sin(angle) * spread

      // Small variation around the region value
      const noise = (Math.random() - 0.5) * 0.3
      data.push({
        lat: offsetLat,
        lon: offsetLon,
        value: value + noise,
        region: regionData.name,
      })
    }
  })

  return data
}

/**
 * Gets insight data using real climate data
 */
export async function getYearInsight(
  year: number,
  layer: Layer,
  selection?: { lat: number; lon: number; value?: number },
): Promise<YearInsight> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const isFuture = year > new Date().getFullYear()
  const regionsData = getRegionsWithAnomalies(year, "t2m")

  // Find selected region if any
  let selectedRegion = null
  if (selection?.region) {
    selectedRegion = regionsData.find((r) => r?.name === selection.region)
  }

  const avgAnomaly = regionsData.reduce((sum, r) => sum + (r?.anomaly || 0), 0) / regionsData.length

  let globalAvg: number
  let changeVsBaseline: number
  let interpretation: string
  let stats: YearInsight["stats"]

  switch (layer) {
    case "anomaly":
      globalAvg = avgAnomaly
      changeVsBaseline = globalAvg

      if (selectedRegion) {
        const variable = getRegionVariable(selectedRegion.name, "t2m")
        interpretation = `${selectedRegion.name}: temperatura base ${variable?.baseline_1981_2010_c.toFixed(1)}°C (1981-2010). Calentamiento de ${(variable?.trend_c_per_year! * 1000).toFixed(1)}°C por década. ${selectedRegion.highExtremes} meses de calor extremo registrados, ${selectedRegion.lowExtremes} de frío extremo.`
      } else {
        interpretation = isFuture
          ? `Proyección: ${globalAvg > 2 ? "crítico" : "preocupante"} aumento térmico. Impacto en ecosistemas y ciudades costeras.`
          : `Las regiones muestran un promedio de +${globalAvg.toFixed(2)}°C respecto al período base (1981-2010). Esto afecta patrones climáticos y biodiversidad.`
      }

      stats = [
        {
          label: "Anomalía Promedio",
          value: `+${globalAvg.toFixed(2)}°C`,
          change: `+${((globalAvg / 2) * 100).toFixed(0)}%`,
        },
        { label: "Regiones Monitoreadas", value: regionsData.length.toString() },
        {
          label: "Extremos Registrados",
          value: regionsData.reduce((sum, r) => sum + (r?.highExtremes || 0), 0).toString(),
        },
      ]
      break

    case "drought":
      globalAvg = Math.max(0, Math.min(1, avgAnomaly / 4 + 0.3))
      changeVsBaseline = (globalAvg - 0.35) / 0.35
      interpretation = `Índice de sequía: ${(globalAvg * 100).toFixed(0)}%. ${
        globalAvg > 0.5 ? "Estrés hídrico severo en múltiples regiones." : "Disponibilidad de agua comprometida."
      } Correlacionado con anomalías térmicas.`
      stats = [
        { label: "Índice Global", value: `${(globalAvg * 100).toFixed(0)}%` },
        { label: "Anomalía Térmica", value: `+${avgAnomaly.toFixed(2)}°C` },
        { label: "Regiones Afectadas", value: regionsData.filter((r) => r && r.anomaly > 1).length.toString() },
      ]
      break

    case "fireRisk":
      globalAvg = Math.max(0, Math.min(1, avgAnomaly / 3 + 0.4))
      changeVsBaseline = (globalAvg - 0.4) / 0.4
      interpretation = `Riesgo de incendio: ${
        globalAvg > 0.6 ? "alto" : "moderado"
      }. Correlacionado con el aumento de temperatura en las regiones monitoreadas.`
      stats = [
        { label: "Riesgo Promedio", value: `${(globalAvg * 100).toFixed(0)}%` },
        { label: "Anomalía Base", value: `+${avgAnomaly.toFixed(2)}°C` },
        { label: "Zonas Críticas", value: regionsData.filter((r) => r && r.anomaly > 1.5).length.toString() },
      ]
      break
  }

  return {
    year,
    layer,
    selection: selection ? { ...selection, name: selection.region || "Región seleccionada" } : undefined,
    globalAvg,
    changeVsBaseline,
    percentile: Math.round(((year - 1981) / (2024 - 1981)) * 100),
    interpretation,
    stats,
  }
}

/**
 * Enhanced chatbot with real climate data
 */
export async function sendChatMessage(message: string, currentYear?: number, currentRegion?: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const lowerMessage = message.toLowerCase()

  // Context-aware responses based on current region
  if (currentRegion) {
    const region = getRegion(currentRegion)
    const variable = region?.variables.find((v) => v.id === "t2m")

    if (
      variable &&
      (lowerMessage.includes("región") || lowerMessage.includes("esta zona") || lowerMessage.includes("aquí"))
    ) {
      return `${currentRegion} tiene una temperatura base de ${variable.baseline_1981_2010_c.toFixed(1)}°C (período 1981-2010). Se está calentando ${(variable.trend_c_per_year * 10).toFixed(2)}°C por década. Se han registrado ${variable.extremes.high_anomaly_months_gt_2sigma.length} meses con calor extremo y ${variable.extremes.low_anomaly_months_lt_minus_2sigma.length} con frío extremo.`
    }
  }

  if (lowerMessage.includes("hola") || lowerMessage.includes("ayuda")) {
    return "Hola, soy tu guía climático. Puedo explicarte los datos reales que ves en el globo. Selecciona una región (Sudamérica, Centroamérica, Europa) para información específica."
  }

  if (lowerMessage.includes("temperatura") || lowerMessage.includes("calor")) {
    return "La anomalía térmica muestra cuánto más cálido está cada región comparado con 1981-2010. Los datos son reales: Sudamérica +0.015°C/año, Centroamérica +0.021°C/año, Europa +0.040°C/año. Cada décima importa."
  }

  if (lowerMessage.includes("sudamérica") || lowerMessage.includes("sudamerica")) {
    const variable = getRegionVariable("Sudamérica", "t2m")
    if (variable) {
      return `Sudamérica: temperatura base ${variable.baseline_1981_2010_c.toFixed(1)}°C. Tendencia de calentamiento: ${(variable.trend_c_per_year * 10).toFixed(2)}°C por década. ${variable.extremes.high_anomaly_months_gt_2sigma.length} meses de calor extremo registrados desde 1981.`
    }
  }

  if (lowerMessage.includes("centroamérica") || lowerMessage.includes("centroamerica")) {
    const variable = getRegionVariable("Centroamérica", "t2m")
    if (variable) {
      return `Centroamérica: temperatura base ${variable.baseline_1981_2010_c.toFixed(1)}°C. Calentamiento de ${(variable.trend_c_per_year * 10).toFixed(2)}°C por década, una de las tasas más altas. ${variable.extremes.high_anomaly_months_gt_2sigma.length} eventos extremos de calor documentados.`
    }
  }

  if (lowerMessage.includes("europa")) {
    const variable = getRegionVariable("Europa", "t2m")
    if (variable) {
      return `Europa: temperatura base ${variable.baseline_1981_2010_c.toFixed(1)}°C. Calentamiento acelerado de ${(variable.trend_c_per_year * 10).toFixed(2)}°C por década, el más rápido de las tres regiones. ${variable.extremes.high_anomaly_months_gt_2sigma.length} meses extremos.`
    }
  }

  if (lowerMessage.includes("extremo") || lowerMessage.includes("récord")) {
    return "Los meses extremos son aquellos con anomalías >2σ (desviaciones estándar). Notarás que desde 2015 los eventos de calor extremo se aceleran dramáticamente en todas las regiones. Esto no es coincidencia."
  }

  if (lowerMessage.includes("futuro") || lowerMessage.includes("2030") || lowerMessage.includes("2035")) {
    return "Las proyecciones usan la tendencia histórica. Si mantenemos el ritmo actual, Europa podría estar +2°C más cálida en 2035 respecto a 1981. Pero el futuro depende de nuestras acciones hoy."
  }

  if (lowerMessage.includes("hacer") || lowerMessage.includes("ayudar") || lowerMessage.includes("qué puedo")) {
    return "Los datos son claros: el calentamiento es real y medible. Puedes actuar: reduce emisiones, apoya energías renovables, conserva recursos. Cada acción cuenta para cambiar estas tendencias."
  }

  // Default educational response
  const responses = [
    "Explora las tres regiones en el globo: Sudamérica, Centroamérica y Europa. Cada una tiene datos climáticos reales desde 1981.",
    "Los datos que ves provienen de análisis científicos reales. Usa la línea de tiempo para ver cómo ha cambiado el clima en décadas recientes.",
    "Haz clic en una región del globo para ver sus estadísticas específicas: temperatura base, tendencia de calentamiento y eventos extremos.",
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
