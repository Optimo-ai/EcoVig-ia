/**
 * Formats a year into a readable date string
 */
export function formatYear(year: number): string {
  return year.toString()
}

/**
 * Generates a seeded random number (for consistent mock data)
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Interpolates between two numbers
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Formats a number with specified decimal places
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

/**
 * Gets a random element from an array (seeded)
 */
export function randomChoice<T>(array: T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * array.length)
  return array[index]
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
