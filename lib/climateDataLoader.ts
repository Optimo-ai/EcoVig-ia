/**
 * Climate Data Loader
 * Loads and processes real climate data from climate-data.json
 */

import climateData from "./climate-data.json"

export interface ClimateVariable {
  id: string
  name: string
  baseline_1981_2010_c: number
  trend_c_per_year: number
  extremes: {
    high_anomaly_months_gt_2sigma: string[]
    low_anomaly_months_lt_minus_2sigma: string[]
  }
}

export interface ClimateRegion {
  name: string
  variables: ClimateVariable[]
}

export interface ClimateData {
  regions: ClimateRegion[]
  metadata: {
    variables_available: string[]
    baseline_period: string
    notes: string
  }
}

const data = climateData as ClimateData

/**
 * Get all available regions
 */
export function getRegions(): ClimateRegion[] {
  return data.regions
}

/**
 * Get region by name
 */
export function getRegion(name: string): ClimateRegion | undefined {
  return data.regions.find((r) => r.name === name)
}

/**
 * Get variable data for a region
 */
export function getRegionVariable(regionName: string, variableId: string): ClimateVariable | undefined {
  const region = getRegion(regionName)
  return region?.variables.find((v) => v.id === variableId)
}

/**
 * Calculate approximate temperature anomaly for a given year
 */
export function calculateAnomaly(baseline: number, trend: number, year: number): number {
  const baseYear = 1981
  const yearsSinceBase = year - baseYear
  return trend * yearsSinceBase
}

/**
 * Get temperature for a specific year
 */
export function getTemperatureForYear(baseline: number, trend: number, year: number): number {
  return baseline + calculateAnomaly(baseline, trend, year)
}

/**
 * Map region name to geographic coordinates (center point)
 */
export function getRegionCoordinates(regionName: string): { lat: number; lon: number } | null {
  const coords: Record<string, { lat: number; lon: number }> = {
    Sudamérica: { lat: -15, lon: -60 },
    Centroamérica: { lat: 15, lon: -85 },
    Europa: { lat: 50, lon: 15 },
  }
  return coords[regionName] || null
}

/**
 * Get all regions with their anomalies for a given year
 */
export function getRegionsWithAnomalies(year: number, variableId = "t2m") {
  return data.regions
    .map((region) => {
      const variable = region.variables.find((v) => v.id === variableId)
      if (!variable) return null

      const anomaly = calculateAnomaly(variable.baseline_1981_2010_c, variable.trend_c_per_year, year)
      const coords = getRegionCoordinates(region.name)

      return {
        name: region.name,
        baseline: variable.baseline_1981_2010_c,
        trend: variable.trend_c_per_year,
        anomaly,
        temperature: getTemperatureForYear(variable.baseline_1981_2010_c, variable.trend_c_per_year, year),
        highExtremes: variable.extremes.high_anomaly_months_gt_2sigma.length,
        lowExtremes: variable.extremes.low_anomaly_months_lt_minus_2sigma.length,
        coords,
      }
    })
    .filter(Boolean)
}

/**
 * Generate time series data for a region
 */
export function generateTimeSeries(regionName: string, variableId: string, startYear = 1981, endYear = 2024) {
  const variable = getRegionVariable(regionName, variableId)
  if (!variable) return []

  const series = []
  for (let year = startYear; year <= endYear; year++) {
    series.push({
      year,
      temperature: getTemperatureForYear(variable.baseline_1981_2010_c, variable.trend_c_per_year, year),
      anomaly: calculateAnomaly(variable.baseline_1981_2010_c, variable.trend_c_per_year, year),
    })
  }
  return series
}
