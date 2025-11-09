"use client"

/**
 * LayerLegend component
 * Shows color scale for the current climate layer
 */

import { useClimateStore } from "@/hooks/useClimateStore"
import { LAYER_CONFIGS } from "@/lib/constants"

export function LayerLegend() {
  const { layer } = useClimateStore()
  const config = LAYER_CONFIGS[layer]

  return (
    <div className="fixed bottom-6 left-6 z-40 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 shadow-lg max-w-[240px]">
      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-2">Escala de Calentamiento</h3>

      {/* Color Scale */}
      <div className="space-y-2">
        <div
          className="h-2.5 rounded-full"
          style={{
            background: `linear-gradient(to right, ${config.colorScale.map((s) => s.color).join(", ")})`,
          }}
        />

        {/* Scale Labels */}
        <div className="flex justify-between text-[10px] text-white/60">
          <span>Frío</span>
          <span>Cálido</span>
        </div>
      </div>
    </div>
  )
}
