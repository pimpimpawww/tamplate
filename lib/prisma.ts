import { PrismaClient } from '@prisma/client'

/**
 * Singleton Pattern untuk Prisma Client
 * Mencegah multiple instances di development hot reload
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

/**
 * Graceful Shutdown Pattern
 * Disconnect database saat process exit
 */
const gracefulShutdown = async () => {
  await prisma.$disconnect()
  process.exit(0)
}

process.on('beforeExit', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

/**
 * Retry Pattern dengan Exponential Backoff
 * Untuk handle transient errors (connection timeout, network issues)
 * 
 * @param fn - Function yang akan di-retry
 * @param maxRetries - Maksimal retry attempts (default: 3)
 * @param baseDelay - Base delay dalam ms (default: 1000ms)
 * @returns Result dari function
 * 
 * @example
 * const user = await withRetry(() => 
 *   prisma.user.findUnique({ where: { email } })
 * )
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Jangan retry jika bukan connection error
      if (!isRetryableError(error)) {
        throw error
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, i)
      
      if (i < maxRetries - 1) {
        console.warn(`[Prisma Retry] Attempt ${i + 1}/${maxRetries} failed, retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }

  console.error('[Prisma Retry] All retry attempts failed')
  throw lastError
}

/**
 * Check apakah error bisa di-retry
 */
function isRetryableError(error: any): boolean {
  const retryableCodes = [
    'P2024', // Timed out fetching connection from pool
    'P1001', // Can't reach database server
    'P1002', // Database server timeout
    'P1008', // Operations timed out
    'P1017', // Server closed connection
  ]

  return retryableCodes.includes(error?.code)
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Connection Health Check
 * Untuk monitoring connection pool dan database status
 * 
 * @returns Object dengan status health, latency, dan error (jika ada)
 * 
 * @example
 * const health = await checkDatabaseHealth()
 * console.log(health) // { healthy: true, latency: 45 }
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  latency: number
  error?: string
}> {
  const start = Date.now()
  
  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    
    return {
      healthy: true,
      latency,
    }
  } catch (error: any) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error.message,
    }
  }
}

/**
 * Transaction Helper dengan timeout
 * Mencegah long-running transactions yang block connections
 * 
 * @param fn - Function yang akan dijalankan dalam transaction
 * @param timeout - Timeout dalam ms (default: 5000ms)
 * @returns Result dari function
 * 
 * @example
 * await withTransaction(async (tx) => {
 *   await tx.user.create({ data: userData })
 *   await tx.profile.create({ data: profileData })
 * }, 5000)
 */
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>,
  timeout = 5000
): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      return await fn(tx as PrismaClient)
    },
    {
      maxWait: timeout, // Max time to wait for transaction to start
      timeout: timeout, // Max time transaction can run
    }
  )
}

/**
 * Batch operation helper
 * Untuk operasi batch yang lebih efisien
 * 
 * @param items - Array of items to process
 * @param batchSize - Size of each batch (default: 100)
 * @param fn - Function to process each batch
 * 
 * @example
 * await batchOperation(users, 50, async (batch) => {
 *   await prisma.user.createMany({ data: batch })
 * })
 */
export async function batchOperation<T>(
  items: T[],
  batchSize: number,
  fn: (batch: T[]) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await fn(batch)
  }
}
