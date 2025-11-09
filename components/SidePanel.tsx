"use client"

/**
 * SidePanel component
 * Smaller panel with Analysis and EcoGuide tabs
 */

import { useState } from "react"
import { AnalysisPanel } from "@/components/AnalysisPanel"
import { EcoGuidePanel } from "@/components/EcoGuidePanel"
import { Button } from "@/components/ui/button"
import { BarChart3, Leaf } from "lucide-react"

export function SidePanel() {
  const [activeTab, setActiveTab] = useState<"analysis" | "guide">("analysis")

  return (
    <div className="fixed right-8 top-44 bottom-8 z-30 w-[350px] max-w-md">
      <div
        className="h-full backdrop-blur-md bg-white/8 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: "fadeIn 0.5s ease-out" }}
      >
        {/* Tab Switcher */}
        <div className="flex gap-2 p-3 border-b border-white/10">
          <Button
            variant={activeTab === "analysis" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("analysis")}
            className={
              activeTab === "analysis"
                ? "flex-1 bg-[#10B981] hover:bg-[#10B981]/80 text-white"
                : "flex-1 text-white/60 hover:text-white hover:bg-white/10"
            }
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Análisis Climático
          </Button>
          <Button
            variant={activeTab === "guide" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("guide")}
            className={
              activeTab === "guide"
                ? "flex-1 bg-[#10B981] hover:bg-[#10B981]/80 text-white"
                : "flex-1 text-white/60 hover:text-white hover:bg-white/10"
            }
          >
            <Leaf className="h-4 w-4 mr-2" />
            EcoGuía
          </Button>
        </div>

        {/* Content with fade transition */}
        <div className="flex-1 overflow-hidden p-4" key={activeTab} style={{ animation: "fadeIn 0.3s ease-out" }}>
          {activeTab === "analysis" ? <AnalysisPanel /> : <EcoGuidePanel />}
        </div>
      </div>
    </div>
  )
}
