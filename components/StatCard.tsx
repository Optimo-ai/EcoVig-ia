"use client"

/**
 * StatCard component
 * Displays a single metric with label, value, and optional change indicator
 */

import { TrendingUp, TrendingDown } from "lucide-react"

type StatCardProps = {
  label: string
  value: string
  change?: string
  trend?: "up" | "down"
}

export function StatCard({ label, value, change, trend }: StatCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-[#dc2626]" : "text-[#10B981]"}`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  )
}
