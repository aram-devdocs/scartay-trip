/**
 * Parse a price string to a numeric value for comparison
 * Handles formats: "$", "$$", "$$$", "$$$$", "$25", "Free", etc.
 */
export function parsePriceToNumber(priceString: string | null | undefined): number | null {
  if (!priceString) return null

  const trimmed = priceString.trim().toLowerCase()

  // Handle "Free"
  if (trimmed === 'free') return 0

  // Handle "$" symbols (e.g., "$", "$$", "$$$", "$$$$")
  if (/^\$+$/.test(trimmed)) {
    return trimmed.length // $ = 1, $$ = 2, $$$ = 3, $$$$ = 4
  }

  // Handle numeric prices (e.g., "$25", "$100", "25")
  const numericMatch = trimmed.match(/\$?(\d+)/)
  if (numericMatch) {
    return parseInt(numericMatch[1], 10)
  }

  return null
}

/**
 * Check if a price falls within a given range
 * Returns true if price is null/undefined (show items without price)
 */
export function isPriceInRange(
  price: string | null | undefined,
  minPrice: number,
  maxPrice: number
): boolean {
  const numericPrice = parsePriceToNumber(price)

  // If no price set, include the item
  if (numericPrice === null) return true

  return numericPrice >= minPrice && numericPrice <= maxPrice
}

/**
 * Get the price range bounds from a list of items
 */
export function getPriceRange(prices: (string | null | undefined)[]): { min: number; max: number } {
  const numericPrices = prices
    .map(parsePriceToNumber)
    .filter((p): p is number => p !== null)

  if (numericPrices.length === 0) {
    return { min: 0, max: 4 } // Default range for $ symbols
  }

  return {
    min: Math.min(...numericPrices),
    max: Math.max(...numericPrices),
  }
}
