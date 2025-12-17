import { getPayload, Payload } from 'payload'
import config from '@payload-config'
import { logger } from './logger'

let payloadClient: Payload | null = null
let connectionAttempts = 0
const MAX_LOG_ATTEMPTS = 3

export const getPayloadClient = async (): Promise<Payload> => {
  if (payloadClient) {
    return payloadClient
  }

  connectionAttempts++
  const startTime = Date.now()

  try {
    logger.debug('Initializing Payload client', {
      operation: 'payload.init',
      attempt: connectionAttempts,
    })

    payloadClient = await getPayload({ config })

    const duration = Date.now() - startTime

    // Only log first few successful connections to avoid noise
    if (connectionAttempts <= MAX_LOG_ATTEMPTS) {
      logger.info('Payload client initialized', {
        operation: 'payload.init',
        duration,
        attempt: connectionAttempts,
      })
    }

    return payloadClient
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error('Failed to initialize Payload client', {
      operation: 'payload.init',
      duration,
      attempt: connectionAttempts,
      databaseUrl: process.env.DATABASE_URL ? '[REDACTED]' : 'NOT_SET',
    }, error)

    throw error
  }
}
