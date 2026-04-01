/**
 * Recursively converts Prisma Decimal and Date objects to
 * plain JS primitives so they can be safely passed to Client Components.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) => {
    // Prisma Decimal has toFixed method
    if (value !== null && typeof value === 'object' && typeof value.toFixed === 'function') {
      return Number(value)
    }
    return value
  }))
}
