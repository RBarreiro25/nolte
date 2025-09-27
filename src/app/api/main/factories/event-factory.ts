import { JwtAdapter } from '../../infra/adapters/jwt-adapter'
import { ConsoleNotificationAdapter } from '../../infra/adapters/notification-adapter'
import { MemoryCacheAdapter } from '../../infra/adapters/memory-cache-adapter'
import { InMemoryEventRepository } from '../../infra/database/in-memory-event-repository'
import { DbCreateEvent } from '../../data/usecases/db-create-event'
import { DbUpdateEvent } from '../../data/usecases/db-update-event'
import { DbGetEvents } from '../../data/usecases/db-get-events'
import { DbGetPublicEvents } from '../../data/usecases/db-get-public-events'
import { DbGenerateSummary } from '../../data/usecases/db-generate-summary'
import { MockAISummaryAdapter } from '../../infra/adapters/ai-summary-adapter'
import { env } from '../config/env'

const eventRepository = new InMemoryEventRepository()
const notificationService = new ConsoleNotificationAdapter()
const cacheService = new MemoryCacheAdapter()
const jwtAdapter = new JwtAdapter(env.jwtSecret)

export const makeCreateEventUseCase = (): DbCreateEvent => {
  return new DbCreateEvent(eventRepository, notificationService)
}

export const makeUpdateEventUseCase = (): DbUpdateEvent => {
  return new DbUpdateEvent(eventRepository, eventRepository, notificationService)
}

export const makeGetEventsUseCase = (): DbGetEvents => {
  return new DbGetEvents(eventRepository)
}

export const makeGetPublicEventsUseCase = (): DbGetPublicEvents => {
  return new DbGetPublicEvents(eventRepository)
}

export const makeJwtAdapter = (): JwtAdapter => {
  return jwtAdapter
}

export const makeCacheService = (): MemoryCacheAdapter => {
  return cacheService
}

export const makeGenerateSummaryUseCase = (): DbGenerateSummary => {
  return new DbGenerateSummary(new MockAISummaryAdapter(cacheService))
}

export const makeAISummaryAdapter = (): MockAISummaryAdapter => {
  return new MockAISummaryAdapter(cacheService)
}

export const makeEventRepository = (): InMemoryEventRepository => {
  return eventRepository
}
