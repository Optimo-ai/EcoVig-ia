"use client"

import { useClimateStore } from "@/hooks/useClimateStore"
import { StatCard } from "@/components/StatCard"
import { ThermometerSun, TrendingUp, MapPin, AlertTriangle } from "lucide-react"
import climateData from "@/lib/climate-data.json"
import { getRegionsWithAnomalies } from "@/lib/climateDataLoader"

const REGION_CITIES = {
  Sudamérica: [
    { name: "São Paulo", lat: -23.55, lon: -46.63 },
    { name: "Buenos Aires", lat: -34.6, lon: -58.38 },
    { name: "Lima", lat: -12.04, lon: -77.03 },
  ],
  Centroamérica: [
    { name: "Ciudad de México", lat: 19.43, lon: -99.13 },
    { name: "Guatemala", lat: 14.64, lon: -90.51 },
    { name: "San José", lat: 9.93, lon: -84.08 },
  ],
  Europa: [
    { name: "Madrid", lat: 40.42, lon: -3.7 },
    { name: "París", lat: 48.86, lon: 2.35 },
    { name: "Berlín", lat: 52.52, lon: 13.4 },
  ],
}

export function AnalysisPanel() {
  const { year, selection } = useClimateStore()
  const regions = getRegionsWithAnomalies(year) // <-- Mueve aquí la llamada

  const regionName = typeof selection === "string" ? selection : selection?.region
  const region = climateData.regions.find((r) => r.name === regionName) || climateData.regions[0]

  if (!region) return null

  const variable = region.variables.find((v) => v.id === "t2m")
  if (!variable) return null

  // Calcula temperatura y anomalía para el año seleccionado
  const yearsSince1981 = year - 1981
  const currentTemp = variable.baseline_1981_2010_c + variable.trend_c_per_year * yearsSince1981
  const anomaly = currentTemp - variable.baseline_1981_2010_c

  const extremeEventsCount =
    variable.extremes.high_anomaly_months_gt_2sigma.length + variable.extremes.low_anomaly_months_lt_minus_2sigma.length

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-4">
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-[#10B981] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{region.name}</h2>
            <p className="text-sm text-white/60">
              Temperatura base: {variable.baseline_1981_2010_c.toFixed(2)}°C
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<ThermometerSun className="h-5 w-5" />}
          label="Temperatura Media"
          value={`${currentTemp.toFixed(1)}°C`}
          trend={anomaly >= 0 ? "up" : "down"}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Anomalía"
          value={`${anomaly >= 0 ? "+" : ""}${anomaly.toFixed(2)}°C`}
          trend={anomaly >= 0 ? "up" : "down"}
        />
      </div>

      <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Tendencia de Calentamiento</h3>
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
              anomaly < 0.5 ? "bg-blue-400" : anomaly < 1.5 ? "bg-yellow-400" : "bg-red-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, (anomaly / 3) * 100))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/50 mt-2">
          <span>0°C</span>
          <span>+3°C</span>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">Análisis Regional</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          La región de {region.name} muestra una tendencia de calentamiento de{" "}
          <span className="text-white font-semibold">+{(variable.trend_c_per_year * 10).toFixed(3)}°C por década</span>.
          La temperatura base histórica (1981-2010) es de {variable.baseline_1981_2010_c.toFixed(2)}°C.
        </p>
        {extremeEventsCount > 0 && (
          <div className="pt-3 border-t border-white/10">
            <h4 className="text-xs font-semibold text-white/70 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Eventos Extremos Registrados
            </h4>
            <div className="text-xs text-white/70 space-y-1">
              <p>
                🔥{" "}
                <span className="text-white/90 font-medium">
                  {variable.extremes.high_anomaly_months_gt_2sigma.length}
                </span>{" "}
                meses con anomalías cálidas extremas (+2σ)
              </p>
              <p>
                ❄️{" "}
                <span className="text-white/90 font-medium">
                  {variable.extremes.low_anomaly_months_lt_minus_2sigma.length}
                </span>{" "}
                meses con anomalías frías extremas (-2σ)
              </p>
              {variable.extremes.high_anomaly_months_gt_2sigma.length > 0 && (
                <p className="mt-2 text-white/60">
                  Último evento extremo cálido:{" "}
                  <span className="text-white/90">
                    {variable.extremes.high_anomaly_months_gt_2sigma[
                      variable.extremes.high_anomaly_months_gt_2sigma.length - 1
                    ].substring(0, 7)}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
