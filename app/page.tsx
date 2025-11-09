"use client"

import { useEffect, useState } from "react"
import { HeaderBar } from "@/components/HeaderBar"
import { FooterBar } from "@/components/FooterBar"
import { StarfieldBackground } from "@/components/StarfieldBackground"
import { TimeControls } from "@/components/TimeControls"
import { GlobeScene } from "@/components/GlobeScene"
import { LayerLegend } from "@/components/LayerLegend"
import { SidePanel } from "@/components/SidePanel"
import { LoadingScreen } from "@/components/LoadingScreen"
import { MobileWarning } from "@/components/MobileWarning"
import { ClimateProvider, useClimateStore } from "@/hooks/useClimateStore"

function HomeContent() {
  const { year, layer, fetchData } = useClimateStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData(year, layer)
  }, [])

  return (
    <>
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Mobile Warning */}
      <MobileWarning />

      <main className="relative min-h-screen overflow-hidden">
        {/* Starfield background */}
        <StarfieldBackground />

        {/* Header */}
        <HeaderBar />

        {/* Main globe scene - More space, no overlap with controls */}
        <div className="relative z-10 pt-20 pb-32 min-h-screen">
          <GlobeScene />
        </div>

        {/* Layer Legend */}
        <LayerLegend />

        {/* Side Panel */}
        <SidePanel />

        {/* Time Controls - Now at bottom */}
        <TimeControls />

        {/* Footer */}
        <FooterBar />
      </main>
    </>
  )
}

export default function Home() {
  return (
    <ClimateProvider>
      <HomeContent />
    </ClimateProvider>
  )
}
