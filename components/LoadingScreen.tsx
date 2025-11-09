"use client"

/**
 * LoadingScreen component
 * Beautiful loading animation while app initializes
 */

import { useEffect, useState } from "react"

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 300)
          return 100
        }
        return prev + 10
      })
    }, 150)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] bg-[#05080B] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#0891B2] flex items-center justify-center animate-float">
            <span className="text-4xl">🌍</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">EcoVig-IA</h1>
          <p className="text-white/60 text-sm">Observatorio Climático</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#0891B2] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2">Cargando datos climáticos...</p>
        </div>
      </div>
    </div>
  )
}
