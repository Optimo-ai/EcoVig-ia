/**
 * Color interpolation utilities for climate data visualization
 */

import type { Layer } from "./types"
import { LAYER_CONFIGS } from "./constants"

/**
 * Converts hex color to RGB array
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
    : [0, 0, 0]
}

/**
 * Interpolates between two RGB colors
 */
function lerpColor(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * t),
    Math.round(color1[1] + (color2[1] - color1[1]) * t),
    Math.round(color1[2] + (color2[2] - color1[2]) * t),
  ]
}

/**
 * Gets color for a value based on the layer's color scale
 */
export function getColorForValue(layer: Layer, value: number): string {
  const config = LAYER_CONFIGS[layer]
  const scale = config.colorScale

  // Find the two colors to interpolate between
  let lowerIdx = 0
  let upperIdx = scale.length - 1

  for (let i = 0; i < scale.length - 1; i++) {
    if (value >= scale[i].value && value <= scale[i + 1].value) {
      lowerIdx = i
      upperIdx = i + 1
      break
    }
  }

  // Clamp to bounds
  if (value <= scale[0].value) return scale[0].color
  if (value >= scale[scale.length - 1].value) return scale[scale.length - 1].color

  // Interpolate
  const lower = scale[lowerIdx]
  const upper = scale[upperIdx]
  const t = (value - lower.value) / (upper.value - lower.value)

  const rgb1 = hexToRgb(lower.color)
  const rgb2 = hexToRgb(upper.color)
  const interpolated = lerpColor(rgb1, rgb2, t)

  return `rgb(${interpolated[0]}, ${interpolated[1]}, ${interpolated[2]})`
}

/**
 * Gets opacity for a value (useful for heatmap visualization)
 */
export function getOpacityForValue(layer: Layer, value: number): number {
  const config = LAYER_CONFIGS[layer]
  const scale = config.colorScale
  const min = scale[0].value
  const max = scale[scale.length - 1].value
  const normalized = (value - min) / (max - min)
  return Math.min(0.3 + normalized * 0.7, 1) // 0.3 to 1.0
}
