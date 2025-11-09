"use client"

/**
 * InsightPanel component
 * Displays year analysis, selected location data, and key metrics
 */

import { useEffect, useState } from "react"
import { useClimateStore } from "@/hooks/useClimateStore"
import { getYearInsight } from "@/lib/mockApi"
import { StatCard } from "@/components/StatCard"
import { LAYER_CONFIGS } from "@/lib/constants"
import type { YearInsight } from "@/lib/types"
import { Loader2, MapPin } from "lucide-react"

export function InsightPanel() {
  const { year, layer, selection } = useClimateStore()
  const [insight, setInsight] = useState<YearInsight | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadInsight = async () => {
      setLoading(true)
      try {
        const data = await getYearInsight(year, layer, selection)
        setInsight(data)
      } catch (error) {
        console.error("[v0] Failed to load insight:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInsight()
  }, [year, layer, selection])

  const config = LAYER_CONFIGS[layer]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Análisis del año</h2>
        <p className="text-sm text-white/60">
          {config.label} • {year}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#10B981]" />
        </div>
      ) : insight ? (
        <>
          {/* Selection Info */}
          {insight.selection && (
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">
                    {insight.selection.name || "Ubicación seleccionada"}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {insight.selection.lat.toFixed(2)}°, {insight.selection.lon.toFixed(2)}°
                  </div>
                  {insight.selection.value !== undefined && (
                    <div className="text-lg font-semibold text-[#10B981] mt-1">
                      {insight.selection.value.toFixed(2)} {config.unit}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Global Stats */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-2">Métricas Globales</h3>
            <div className="grid gap-3">
              {insight.stats.map((stat, idx) => (
                <StatCard
                  key={idx}
                  label={stat.label}
                  value={stat.value}
                  change={stat.change}
                  trend={stat.change?.startsWith("+") ? "up" : undefined}
                />
              ))}
            </div>
          </div>

          {/* Change vs Baseline */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-xs text-white/60 mb-1">
              Cambio vs {LAYER_CONFIGS[layer].id === "anomaly" ? "período base" : "promedio histórico"}
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {insight.changeVsBaseline > 0 ? "+" : ""}
              {(insight.changeVsBaseline * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-white/50">Percentil {insight.percentile}</div>
          </div>

          {/* Interpretation */}
          <div className="bg-gradient-to-br from-[#065F46]/20 to-[#0891B2]/20 border border-[#10B981]/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#10B981] mb-2">¿Qué significa esto?</h3>
            <p className="text-sm text-white/80 leading-relaxed">{insight.interpretation}</p>
          </div>
        </>
      ) : null}
    </div>
  )
}
