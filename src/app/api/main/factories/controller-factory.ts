import { CreateEventController } from '../../presentation/controllers/create-event-controller'
import { UpdateEventController } from '../../presentation/controllers/update-event-controller'
import { GetEventsController } from '../../presentation/controllers/get-events-controller'
import { GetPublicEventsController } from '../../presentation/controllers/get-public-events-controller'
import { GetSummaryController } from '../../presentation/controllers/get-summary-controller'
import { makeCreateEventUseCase, makeUpdateEventUseCase, makeGetEventsUseCase, makeGetPublicEventsUseCase, makeJwtAdapter, makeGenerateSummaryUseCase, makeEventRepository } from './event-factory'
import { AuthMiddleware } from '../middlewares/auth-middleware'
import { Controller } from '../../presentation/protocols/controller'

const authMiddleware = new AuthMiddleware(makeJwtAdapter())

export const makeCreateEventController = (): Controller => {
  return new CreateEventController(makeCreateEventUseCase(), authMiddleware)
}

export const makeUpdateEventController = (): Controller => {
  return new UpdateEventController(makeUpdateEventUseCase(), authMiddleware)
}

export const makeGetEventsController = (): Controller => {
  return new GetEventsController(makeGetEventsUseCase(), authMiddleware)
}

export const makeGetPublicEventsController = (): Controller => {
  return new GetPublicEventsController(makeGetPublicEventsUseCase())
}

export const makeGetSummaryController = (): Controller => {
  return new GetSummaryController(makeGenerateSummaryUseCase(), makeEventRepository())
}

export const makeController = (method: string, url: string): Controller => {
  const pathname = new URL(url).pathname

  if (pathname.includes('/public/events') && pathname.includes('/summary')) {
    return makeGetSummaryController()
  }
  
  if (pathname.includes('/public/events')) {
    return makeGetPublicEventsController()
  }
  
  if (pathname.includes('/events')) {
    if (method === 'POST') {
      return makeCreateEventController()
    }
    if (method === 'PATCH') {
      return makeUpdateEventController()
    }
    if (method === 'GET') {
      return makeGetEventsController()
    }
  }

  throw new Error(`No controller found for ${method} ${pathname}`)
}
