"use client"

/**
 * TimeControls component
 * Compact slider and controls below the header
 */

import { useEffect, useCallback } from "react"
import { useClimateStore } from "@/hooks/useClimateStore"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LAYER_CONFIGS } from "@/lib/constants"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import type { Layer } from "@/lib/types"

export function TimeControls() {
  const { year, minYear, maxYear, setYear, layer, setLayer, isPlaying, speed, play, pause, step, setSpeed } =
    useClimateStore()

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      step(1)
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed, step])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        step(-1)
      } else if (e.key === "ArrowRight") {
        step(1)
      } else if (e.key === " ") {
        e.preventDefault()
        isPlaying ? pause() : play()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, play, pause, step])

  const handleYearChange = useCallback(
    (values: number[]) => {
      setYear(values[0])
    },
    [setYear],
  )

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-6">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Year Display - Compact */}
          <div className="text-center min-w-[100px]">
            <div className="text-3xl font-bold text-white tabular-nums">{year}</div>
            <div className="text-[10px] text-white/50 mt-0.5">
              {year > new Date().getFullYear() ? "Proyección" : "Histórico"}
            </div>
          </div>

          {/* Slider */}
          <div className="flex-1">
            <Slider
              value={[year]}
              onValueChange={handleYearChange}
              min={minYear}
              max={maxYear}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>{minYear}</span>
              <span>{maxYear}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => step(-1)}
              disabled={year <= minYear}
              className="h-8 w-8 bg-white/5 border-white/20 hover:bg-white/10 text-white disabled:opacity-30"
              aria-label="Año anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={isPlaying ? pause : play}
              className="h-8 w-8 bg-white/5 border-white/20 hover:bg-white/10 text-white"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => step(1)}
              disabled={year >= maxYear}
              className="h-8 w-8 bg-white/5 border-white/20 hover:bg-white/10 text-white disabled:opacity-30"
              aria-label="Siguiente año"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-1">
            {([1, 2, 4] as const).map((s) => (
              <Button
                key={s}
                variant={speed === s ? "default" : "ghost"}
                size="sm"
                onClick={() => setSpeed(s)}
                className={
                  speed === s
                    ? "h-7 bg-[#10B981] hover:bg-[#10B981]/80 text-white text-xs"
                    : "h-7 text-white/60 hover:text-white hover:bg-white/10 text-xs"
                }
                aria-label={`Velocidad ${s}x`}
              >
                {s}x
              </Button>
            ))}
          </div>

          {/* Layer Selector */}
          <Select value={layer} onValueChange={(value: Layer) => setLayer(value)}>
            <SelectTrigger className="w-[140px] h-8 bg-white/5 border-white/20 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(LAYER_CONFIGS).map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  <span className="flex items-center gap-2 text-xs">
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
