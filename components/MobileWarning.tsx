"use client"

/**
 * MobileWarning component
 * Suggests landscape mode for better mobile experience
 */

import { useState, useEffect } from "react"
import { Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileWarning() {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Show warning on portrait mobile
      const isMobile = window.innerWidth < 768
      const isPortrait = window.innerHeight > window.innerWidth
      setShowWarning(isMobile && isPortrait)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[90] bg-[#05080B]/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-[#10B981] rotate-90" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Mejor experiencia</h2>
        <p className="text-sm text-white/70 mb-4 leading-relaxed">
          Para explorar el observatorio climático, te recomendamos usar modo horizontal o una pantalla más grande.
        </p>
        <Button onClick={() => setShowWarning(false)} className="w-full bg-[#10B981] hover:bg-[#10B981]/80 text-white">
          Continuar de todos modos
        </Button>
      </div>
    </div>
  )
}
