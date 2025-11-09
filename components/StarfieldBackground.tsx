"use client"

/**
 * StarfieldBackground component
 * Enhanced parallax starfield with slow motion
 */

import { useEffect, useRef } from "react"
import { throttle } from "@/lib/helpers"

type Star = {
  x: number
  y: number
  radius: number
  opacity: number
  layer: number
  speed: number
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      starsRef.current = []
      const numStars = Math.floor((canvas.width * canvas.height) / 5000)

      for (let i = 0; i < numStars; i++) {
        const layer = Math.floor(Math.random() * 4) // 4 depth layers
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          opacity: Math.random() * 0.2 + 0.05,
          layer,
          speed: (layer + 1) * 0.015, // Slower parallax speeds
        })
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      starsRef.current.forEach((star) => {
        // Slow horizontal parallax movement
        star.x += star.speed
        if (star.x > canvas.width) star.x = 0

        // Subtle vertical drift for depth
        star.y += star.speed * 0.3
        if (star.y > canvas.height) star.y = 0

        // Draw star with subtle glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 2)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const handleVisibilityChange = () => {
      if (document.hidden && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      } else {
        animate()
      }
    }

    resizeCanvas()
    animate()

    const throttledResize = throttle(resizeCanvas, 250)
    window.addEventListener("resize", throttledResize)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("resize", throttledResize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ willChange: "transform" }} />
  )
}
