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
  selection?: { lat: number; lon: number; value?: number; region?: string },
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

export async function sendChatMessage(
  message: string,
  currentYear?: number,
  currentRegion?: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // pasamos todo a minúsculas y quitamos tildes
  const lowerMessage = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  const isFuture = currentYear && currentYear > new Date().getFullYear()

  // ---------- SALUDOS ----------
  if (
    lowerMessage.includes("hola") ||
    lowerMessage.includes("buenas") ||
    lowerMessage.includes("buen dia") ||
    lowerMessage.includes("buenos dias") ||
    lowerMessage.includes("buenas tardes") ||
    lowerMessage.includes("buenas noches") ||
    lowerMessage.includes("hey") ||
    lowerMessage.includes("que tal")
  ) {
    return "🌱 Hola, soy tu EcoGuía IA. Puedo explicarte el cambio climático con datos reales y contarte qué pasa en Sudamérica, Centroamérica y Europa. Pregúntame lo que quieras."
  }

  if (lowerMessage.includes("gracias")) {
    return "💚 Gracias a ti por interesarte en el clima. Informarse ya es un primer paso para cambiar la historia que ves en estos datos."
  }

  // ---------- CAMBIO CLIMÁTICO / CONTAMINACIÓN ----------
  if (
    lowerMessage.includes("cambio climatico") ||
    lowerMessage.includes("calentamiento global") ||
    lowerMessage.includes("por que se calienta") ||
    lowerMessage.includes("que es el clima")
  ) {
    return "🌍 El cambio climático es el calentamiento anormal y rápido del planeta causado sobre todo por actividades humanas: quemar combustibles fósiles, talar bosques y producir demasiada basura. Eso altera las estaciones y hace más probables sequías, inundaciones e incendios."
  }

  if (
    lowerMessage.includes("contaminacion") ||
    lowerMessage.includes("co2") ||
    lowerMessage.includes("emisiones")
  ) {
    return "🌫️ La contaminación, especialmente el CO₂, actúa como una manta que atrapa el calor alrededor de la Tierra. Cuanto más contaminamos, más se calienta el planeta. Reducir emisiones, usar energías limpias y proteger bosques ayuda a frenar esa manta de calor."
  }

  if (
    lowerMessage.includes("ira a peor") ||
    lowerMessage.includes("todo ira a peor") ||
    lowerMessage.includes("estamos a tiempo") ||
    lowerMessage.includes("hay esperanza") ||
    lowerMessage.includes("futuro")
  ) {
    return "⏳ Los datos muestran una tendencia clara: cada década hace más calor y los extremos son más frecuentes. Si seguimos igual irá a peor, pero no está decidido: políticas climáticas, cambios en cómo producimos energía y acciones comunitarias pueden frenar esa curva."
  }

  if (
    lowerMessage.includes("que puedo hacer") ||
    lowerMessage.includes("como ayudar") ||
    lowerMessage.includes("acciones") ||
    lowerMessage.includes("hacer algo")
  ) {
    return "🤲 Tres acciones con mucho impacto: 1) usar menos energía y apoyar renovables, 2) elegir transporte más limpio (caminar, bici, transporte público), 3) cuidar y defender bosques y áreas verdes. Y hablar del tema para que más personas se sumen."
  }

  // ---------- CONTEXTO DE REGION + AÑO ----------
  if (currentRegion) {
    const region = getRegion(currentRegion)
    const variable = region?.variables.find((v) => v.id === "t2m")

    if (
      variable &&
      (lowerMessage.includes("region") ||
        lowerMessage.includes("esta zona") ||
        lowerMessage.includes("aqui") ||
        lowerMessage.includes("aqui") ||
        lowerMessage.includes("datos"))
    ) {
      const base = variable.baseline_1981_2010_c
      const trendDecade = variable.trend_c_per_year * 10
      const highExtremes = variable.extremes?.high_anomaly_months_gt_2sigma?.length ?? 0
      const lowExtremes = variable.extremes?.low_anomaly_months_lt_minus_2sigma?.length ?? 0

      let yearPart = ""
      if (currentYear) {
        const deltaYears = currentYear - 1981
        const approxAnomaly = variable.trend_c_per_year * deltaYears
        yearPart = isFuture
          ? ` Si extrapolamos la tendencia, para ${currentYear} esta región podría estar alrededor de +${approxAnomaly.toFixed(
              2,
            )}°C sobre su clima “normal”.`
          : ` Alrededor de ${currentYear}, esta región ya acumula aproximadamente +${approxAnomaly.toFixed(
              2,
            )}°C respecto a 1981.`
      }

      return `📍 ${currentRegion}: su temperatura media “normal” era de ${base.toFixed(
        1,
      )}°C en 1981–2010. Se está calentando unos ${trendDecade.toFixed(
        2,
      )}°C por década. Hasta ahora se han registrado ${highExtremes} meses con calor extremo y ${lowExtremes} con frío extremo.${yearPart}`
    }
  }

  // ---------- REGIONES ESPECÍFICAS POR NOMBRE ----------
  if (lowerMessage.includes("sudamerica") || lowerMessage.includes("sudamérica")) {
    const variable = getRegionVariable("Sudamérica", "t2m")
    if (variable) {
      const highExtremes = variable.extremes?.high_anomaly_months_gt_2sigma?.length ?? 0
      return `🌎 Sudamérica: temperatura base ${variable.baseline_1981_2010_c.toFixed(
        1,
      )}°C y calentamiento aproximado de ${(variable.trend_c_per_year * 10).toFixed(
        2,
      )}°C por década. Se han observado al menos ${highExtremes} meses con calor extremo desde 1981.`
    }
  }

  if (lowerMessage.includes("centroamerica") || lowerMessage.includes("centroamérica")) {
    const variable = getRegionVariable("Centroamérica", "t2m")
    if (variable) {
      const highExtremes = variable.extremes?.high_anomaly_months_gt_2sigma?.length ?? 0
      return `🌴 Centroamérica: una región ya muy cálida, con base de ${variable.baseline_1981_2010_c.toFixed(
        1,
      )}°C y subida de ${(variable.trend_c_per_year * 10).toFixed(
        2,
      )}°C por década. ${highExtremes} meses de calor extremo indican noches más calurosas y más presión sobre agricultura y bosques.`
    }
  }

  if (lowerMessage.includes("europa")) {
    const variable = getRegionVariable("Europa", "t2m")
    if (variable) {
      const highExtremes = variable.extremes?.high_anomaly_months_gt_2sigma?.length ?? 0
      return `🌍 Europa: temperatura base ${variable.baseline_1981_2010_c.toFixed(
        1,
      )}°C, pero se calienta muy rápido: ${(variable.trend_c_per_year * 10).toFixed(
        2,
      )}°C por década. Los ${highExtremes} meses de calor extremo explican olas de calor e incendios cada vez más frecuentes.`
    }
  }

  // ---------- EXTREMOS / RÉCORDS ----------
  if (lowerMessage.includes("extremo") || lowerMessage.includes("record") || lowerMessage.includes("récord")) {
    return "🔥 Llamamos meses extremos a los que se desvían más de 2 desviaciones estándar de lo normal. Antes eran raros; desde 2015 aparecen una y otra vez, señal de que el clima está saliéndose de los patrones habituales."
  }

  // ---------- POR DEFECTO: RESPUESTA EDUCATIVA ----------
  if (lowerMessage.includes("explica") || lowerMessage.includes("datos") || lowerMessage.includes("grafica")) {
    return "📈 Las líneas y colores que ves comparan el clima actual con el período 1981–2010. Mientras más rojo, más se aleja de lo normal. No es un simple ciclo: la tendencia es clara y ascendente."
  }

  const genericResponses = [
    "Puedes mover la línea de tiempo y hacer clic en una región del globo. Yo te explico cómo han cambiado sus temperaturas y qué significa para las comunidades.",
    "Lo que ves en EcoVig-IA no son opiniones, son datos. Y nos dicen que el calentamiento es real y acelerado. La buena noticia: todavía podemos cambiar la curva.",
    "Si quieres, pregúntame por Sudamérica, Centroamérica o Europa y te cuento su historia climática desde 1981.",
  ]

  return genericResponses[Math.floor(Math.random() * genericResponses.length)]
}
