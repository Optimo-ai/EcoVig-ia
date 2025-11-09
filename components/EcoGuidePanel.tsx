"use client"

import type React from "react"

import { useState } from "react"
import { Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getRegions, calculateAnomaly } from "@/lib/climateDataLoader"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function EcoGuidePanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hola, soy EcoGuía, tu asistente climático. Puedo responder preguntas sobre datos climáticos de Sudamérica, Centroamérica y Europa. ¿Qué te gustaría saber?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generateResponse = (question: string): string => {
    const lowerQ = question.toLowerCase()
    const regions = getRegions()

    // Preguntas sobre regiones específicas
    if (lowerQ.includes("sudamérica") || lowerQ.includes("sudamerica")) {
      const region = regions.find((r) => r.name === "Sudamérica")
      const t2m = region?.variables.find((v) => v.id === "t2m")
      if (t2m) {
        const anomaly2024 = calculateAnomaly(t2m.baseline_1981_2010_c, t2m.trend_c_per_year, 2024)
        return `Sudamérica tiene una temperatura base de ${t2m.baseline_1981_2010_c.toFixed(1)}°C (1981-2010). La región muestra un calentamiento de ${t2m.trend_c_per_year.toFixed(4)}°C por año. Para 2024, la anomalía es de aproximadamente ${anomaly2024.toFixed(2)}°C. Se han registrado ${t2m.extremes.high_anomaly_months_gt_2sigma.length} meses con anomalías altas extremas.`
      }
    }

    if (lowerQ.includes("centroamérica") || lowerQ.includes("centroamerica")) {
      const region = regions.find((r) => r.name === "Centroamérica")
      const t2m = region?.variables.find((v) => v.id === "t2m")
      if (t2m) {
        const anomaly2024 = calculateAnomaly(t2m.baseline_1981_2010_c, t2m.trend_c_per_year, 2024)
        return `Centroamérica tiene una temperatura base de ${t2m.baseline_1981_2010_c.toFixed(1)}°C. La tendencia de calentamiento es de ${t2m.trend_c_per_year.toFixed(4)}°C por año. La anomalía en 2024 es de aproximadamente ${anomaly2024.toFixed(2)}°C. Esta región ha experimentado ${t2m.extremes.high_anomaly_months_gt_2sigma.length} eventos extremos de calor.`
      }
    }

    if (lowerQ.includes("europa")) {
      const region = regions.find((r) => r.name === "Europa")
      const t2m = region?.variables.find((v) => v.id === "t2m")
      if (t2m) {
        const anomaly2024 = calculateAnomaly(t2m.baseline_1981_2010_c, t2m.trend_c_per_year, 2024)
        return `Europa muestra una temperatura base de ${t2m.baseline_1981_2010_c.toFixed(1)}°C. Con una tendencia de ${t2m.trend_c_per_year.toFixed(4)}°C por año, la anomalía en 2024 alcanza ${anomaly2024.toFixed(2)}°C. Se han registrado ${t2m.extremes.high_anomaly_months_gt_2sigma.length} meses con anomalías térmicas significativas.`
      }
    }

    // Preguntas sobre calentamiento global
    if (lowerQ.includes("calentamiento") || lowerQ.includes("temperatura") || lowerQ.includes("calor")) {
      return `Todas las regiones monitoreadas muestran tendencias de calentamiento positivas. Sudamérica: +${regions[0]?.variables[0]?.trend_c_per_year.toFixed(4)}°C/año, Centroamérica: +${regions[1]?.variables[0]?.trend_c_per_year.toFixed(4)}°C/año, Europa: +${regions[2]?.variables[0]?.trend_c_per_year.toFixed(4)}°C/año. Esto confirma el patrón de cambio climático global.`
    }

    // Preguntas sobre eventos extremos
    if (lowerQ.includes("extremos") || lowerQ.includes("eventos")) {
      const totalHighExtremes = regions.reduce(
        (sum, r) => sum + (r.variables[0]?.extremes.high_anomaly_months_gt_2sigma.length || 0),
        0,
      )
      return `Los datos muestran ${totalHighExtremes} eventos extremos de calor entre todas las regiones. Estos eventos están aumentando en frecuencia, indicando mayor inestabilidad climática. Las anomalías superiores a 2 desviaciones estándar son particularmente preocupantes.`
    }

    // Preguntas sobre datos
    if (lowerQ.includes("datos") || lowerQ.includes("información")) {
      return `Nuestros datos cubren Sudamérica, Centroamérica y Europa desde 1981 hasta 2024. Usamos el periodo 1981-2010 como referencia base. Los datos incluyen temperatura superficial (t2m), tendencias de calentamiento y eventos extremos documentados. Todo está basado en observaciones científicas reales.`
    }

    // Preguntas sobre qué hacer
    if (lowerQ.includes("hacer") || lowerQ.includes("ayudar") || lowerQ.includes("acción")) {
      return `Acciones clave: 1) Reducir emisiones de carbono usando transporte sostenible, 2) Consumir energía renovable, 3) Adoptar dieta plant-based, 4) Apoyar políticas climáticas, 5) Educar a otros. Cada 0.1°C de calentamiento evitado reduce significativamente los impactos extremos.`
    }

    // Preguntas sobre el futuro
    if (lowerQ.includes("futuro") || lowerQ.includes("2030") || lowerQ.includes("2050")) {
      return `Si las tendencias actuales continúan, para 2050 veremos incrementos de temperatura de 1-2°C adicionales en estas regiones. Esto significa más sequías, olas de calor, y eventos extremos. Sin embargo, si actuamos ahora reduciendo emisiones, podemos limitar el daño y estabilizar el clima.`
    }

    // Respuesta por defecto
    return `Puedo ayudarte con información sobre datos climáticos de Sudamérica, Centroamérica y Europa, incluyendo temperaturas, tendencias de calentamiento, eventos extremos, y acciones climáticas. ¿Qué aspecto específico te interesa?`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate processing delay
    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: Message = { role: "assistant", content: response }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-4">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-[#10B981]" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-[#10B981]/20 text-white"
                  : "backdrop-blur-sm bg-white/5 border border-white/10 text-white/90"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-[#10B981]" />
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-white/10">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre el clima..."
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="bg-[#10B981] hover:bg-[#0ea270] text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
