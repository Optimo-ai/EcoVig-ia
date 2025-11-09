"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useClimateStore } from "@/hooks/useClimateStore"
import { sendChatMessage } from "@/lib/mockApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import type { ChatMessage } from "@/lib/types"

/**
 * ChatbotPanel component
 * Educational chatbot for climate questions
 */
export function ChatbotPanel() {
  const { year, selection } = useClimateStore()

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hola, soy tu guía climático con datos reales 🌍.",
      timestamp: new Date(),
    },
    {
      id: "2",
      role: "assistant",
      content:
        "Puedes saludarme o preguntarme sobre cambio climático, contaminación o sobre Sudamérica, Centroamérica y Europa.",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed, // <-- aquí se envía todo el texto, con espacios
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await sendChatMessage(trimmed, year, selection?.region)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[EcoVig-IA] Chat error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-white mb-1">EcoGuía IA</h2>
        <p className="text-sm text-white/60">Pregunta algo sobre el clima o sobre tu región 🌱</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-[#10B981] text-white"
                  : "bg-white/8 text-white/90 border border-white/10"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/8 border border-white/10 rounded-2xl px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-[#10B981]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe una pregunta, por ejemplo: ¿qué es el cambio climático?"
          disabled={loading}
          className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
        />
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          size="icon"
          className="bg-[#10B981] hover:bg-[#10B981]/80 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
