"use client"

/**
 * FooterBar component
 * Displays credits and data sources with animated wave decoration
 */

export function FooterBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-sm bg-[#065F46]/20 border-t border-[#10B981]/20">
      {/* Animated wave decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50 animate-pulse-glow" />

      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/60">
        <p>Datos abiertos (Copernicus) • Proyecto educativo para comunidades</p>
        <a href="#" className="text-[#10B981] hover:text-[#10B981]/80 transition-colors">
          Política de uso de datos
        </a>
      </div>
    </footer>
  )
}
