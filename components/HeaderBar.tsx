"use client"

/**
 * HeaderBar component
 * Displays the app logo, rotating reflective phrase, and action buttons
 */

import { useState, useEffect } from "react"
import { REFLECTIVE_PHRASES } from "@/lib/constants"

export function HeaderBar() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % REFLECTIVE_PHRASES.length)
    }, 8000) // Rotate every 8 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/20 border-b border-white/5">
      <div className="container mx-auto px-4 py-6">
        <p className="text-base md:text-lg font-medium text-center text-white/95 text-balance transition-opacity duration-1000 max-w-3xl mx-auto">
          {REFLECTIVE_PHRASES[phraseIndex]}
        </p>
      </div>
    </header>
  )
}
