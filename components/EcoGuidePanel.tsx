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
        "Hola, soy EcoGuía 🌱. Puedo responder preguntas sobre cambio climático y sobre los datos reales de Sudamérica, Centroamérica y Europa. ¿Qué te gustaría saber?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generateResponse = (question: string): string => {
    // normalizamos: minúsculas y sin tildes
    const cleanQ = question
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    const regions = getRegions()

    // --- SALUDOS ---
    if (
      cleanQ.includes("hola") ||
      cleanQ.includes("buenas") ||
      cleanQ.includes("buen dia") ||
      cleanQ.includes("buenos dias") ||
      cleanQ.includes("buenas tardes") ||
      cleanQ.includes("buenas noches") ||
      cleanQ.includes("hey") ||
      cleanQ.includes("que tal")
    ) {
      return "🌱 Hola, soy EcoGuía. Estoy aquí para ayudarte a entender qué está pasando con el clima usando datos reales. Pregúntame, por ejemplo: “¿qué es el cambio climático?” o “¿cómo va Sudamérica?”."
    }

    if (cleanQ.includes("gracias")) {
      return "💚 Gracias a ti por interesarte por el clima. Informarse y compartir estos temas ya es una forma de cuidar el planeta."
    }

    // --- CAMBIO CLIMÁTICO / CONTAMINACIÓN ---
    if (
      cleanQ.includes("cambio climatico") ||
      cleanQ.includes("calentamiento global") ||
      cleanQ.includes("por que se calienta") ||
      cleanQ.includes("que es el clima")
    ) {
      return "🌍 El cambio climático es el calentamiento anormal y rápido del planeta causado sobre todo por actividades humanas: quemar combustibles fósiles, talar bosques y producir mucha basura. Eso hace más frecuentes las olas de calor, las sequías, las lluvias extremas y los incendios."
    }

    if (
      cleanQ.includes("contaminacion") ||
      cleanQ.includes("co2") ||
      cleanQ.includes("emisiones")
    ) {
      return "🌫️ La contaminación, especialmente el CO₂, funciona como una manta que atrapa el calor alrededor de la Tierra. Cuanto más emitimos, más se calienta el planeta. Reducir emisiones, usar energías renovables y proteger bosques ayuda a afinar esa manta."
    }

    // --- REGIONES ESPECÍFICAS ---

    if (cleanQ.includes("sudamerica")) {
      const region = regions.find((r) => r.name === "Sudamérica")
      const t2m = region?.variables.find((v) => v.id === "t2m")
      if (t2m) {
        const anomaly2024 = calculateAnomaly(t2m.baseline_1981_2010_c, t2m.trend_c_per_year, 2024)
        return `🌎 Sudamérica tiene una temperatura base de ${t2m.baseline_1981_2010_c.toFixed(
          1,
        )}°C (1981–2010) y se calienta unos ${t2m.trend_c_per_year.toFixed(
          4,
        )}°C por año. Para 2024, la anomalía estimada es de ~${anomaly2024.toFixed(
          2,
        )}°C por encima de lo normal. Se han registrado ${
          t2m.extremes?.high_anomaly_months_gt_2sigma?.length ?? 0
        } meses con calor extremo.`
      }
    }

    if (cleanQ.includes("centroamerica")) {
      const region = regions.find((r) => r.name === "Centroamérica")
      const t2m = region?.variables.find((v) => v.id === "t2m")
      if (t2m) {
        const anomaly2024 = calculateAnomaly(t2m.baseline_1981_2010_c, t2m.trend_c_per_year, 2024)
        return `🌴 Centroamérica tiene una temperatura base de ${t2m.baseline_1981_2010_c.toFixed(
          1,
        )}°C y una tendencia de calentamiento de ${t2m.trend_c_per_year.toFixed(
          4,
        )}°C por año. En 2024, la anomalía estimada es de ~${anomaly2024.toFixed(
          2,
        )}°C. Esta región ha vivido ${
          t2m.extremes?.high_anomaly_months_gt_2sigma?.length ?? 0
        } meses de calor extremo.`
      }
    }

    if (cleanQ.includes("europa")) {
      const region = regions.find((r) => r.name === "Europa")
      const t2m = region?.variables.find((v) => v.id === "t2m")
      if (t2m) {
        const anomaly2024 = calculateAnomaly(t2m.baseline_1981_2010_c, t2m.trend_c_per_year, 2024)
        return `🌍 Europa parte de una temperatura base de ${t2m.baseline_1981_2010_c.toFixed(
          1,
        )}°C, pero se calienta muy rápido: ${t2m.trend_c_per_year.toFixed(
          4,
        )}°C por año. Para 2024, la anomalía estimada es de ~${anomaly2024.toFixed(
          2,
        )}°C. Se han registrado ${
          t2m.extremes?.high_anomaly_months_gt_2sigma?.length ?? 0
        } meses con calor extremo.`
      }
    }

    // --- CALENTAMIENTO / TEMPERATURA GENERAL ---
    if (
      cleanQ.includes("calentamiento") ||
      cleanQ.includes("temperatura") ||
      cleanQ.includes("calor")
    ) {
      const sAm = regions.find((r) => r.name === "Sudamérica")?.variables[0]
      const cAm = regions.find((r) => r.name === "Centroamérica")?.variables[0]
      const eu = regions.find((r) => r.name === "Europa")?.variables[0]

      return `📈 Todas las regiones monitoreadas muestran calentamiento:
- Sudamérica: +${sAm?.trend_c_per_year.toFixed(4)}°C/año
- Centroamérica: +${cAm?.trend_c_per_year.toFixed(4)}°C/año
- Europa: +${eu?.trend_c_per_year.toFixed(4)}°C/año

Cada décima de grado extra hace más probables las olas de calor, sequías y eventos extremos.`
    }

    // --- EVENTOS EXTREMOS ---
    if (cleanQ.includes("extremos") || cleanQ.includes("eventos") || cleanQ.includes("record")) {
      const totalHighExtremes = regions.reduce((sum, r) => {
        const v0 = r.variables[0]
        const count = v0?.extremes?.high_anomaly_months_gt_2sigma?.length ?? 0
        return sum + count
      }, 0)

      return `🔥 Los datos muestran al menos ${totalHighExtremes} meses con calor extremo (anomalías muy por encima de lo normal) entre todas las regiones. Antes eran raros; ahora son cada vez más frecuentes, una señal clara del cambio climático.`
    }

    // --- PREGUNTAS SOBRE DATOS / INFORMACIÓN ---
    if (cleanQ.includes("datos") || cleanQ.includes("informacion") || cleanQ.includes("info")) {
      return "📊 Los datos que ves cubren Sudamérica, Centroamérica y Europa desde 1981 hasta 2024. Tomamos 1981–2010 como clima “normal” y medimos cuánto se alejan las temperaturas actuales de ese valor. Incluimos tendencias de calentamiento y meses con anomalías extremas."
    }

    // --- QUÉ PUEDO HACER / ACCIÓN ---
    if (
      cleanQ.includes("hacer") ||
      cleanQ.includes("ayudar") ||
      cleanQ.includes("accion") ||
      cleanQ.includes("acciones")
    ) {
      return "🤲 Puedes ayudar de muchas formas: reducir tu consumo de energía, elegir transporte sostenible, apoyar energías renovables, cuidar áreas verdes y bosques, y difundir información clara sobre el clima. Cada acción suma para cambiar la tendencia que ves."
    }

    // --- FUTURO / PROYECCIONES ---
    if (cleanQ.includes("futuro") || cleanQ.includes("2030") || cleanQ.includes("2050")) {
      return "⏳ Si las tendencias actuales continúan, para 2050 podríamos ver 1–2 °C adicionales en muchas regiones. Eso implica más estrés hídrico, olas de calor y eventos extremos. Pero no es inevitable: si reducimos emisiones y protegemos ecosistemas ahora, podemos limitar gran parte de ese calentamiento."
    }

    // --- RESPUESTA POR DEFECTO ---
    return "Puedo ayudarte con información sobre datos climáticos de Sudamérica, Centroamérica y Europa: temperaturas, tendencias de calentamiento, eventos extremos y qué podemos hacer. Prueba algo como: “¿qué es el cambio climático?”, “cuéntame sobre Sudamérica” o “qué puedo hacer para ayudar?”."
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: Message = { role: "assistant", content: response }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 400)
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
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-[#10B981]" />
            </div>
            <div className="backdrop-blur-sm bg.white/5 border border-white/10 rounded-2xl px-4 py-3">
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
