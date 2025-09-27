import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { GetEvents, GetEventsRequest } from '../../domain/usecases/get-events'
import { ok, badRequest, unauthorized, serverError } from '../helpers/http-helper'
import { createValidationError } from '../helpers/error-response'
import { getEventsQuerySchema } from '../../infra/validators/zod-schemas'
import { AuthMiddleware } from '../../main/middlewares/auth-middleware'

export class GetEventsController implements Controller {
  constructor(
    private readonly getEvents: GetEvents,
    private readonly authMiddleware: AuthMiddleware
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const authHeader = httpRequest.headers?.authorization?.replace('Bearer ', '') || ''
      const authResult = await this.authMiddleware.handle(authHeader)
      
      if (authResult.error) {
        return unauthorized()
      }

      const validation = getEventsQuerySchema.safeParse(httpRequest.body)
      if (!validation.success) {
        const details = validation.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return badRequest(createValidationError(details))
      }

      const result = await this.getEvents.handle(validation.data as GetEventsRequest)

      const response = {
        events: result.events,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      }

      return ok(response)
    } catch (error) {
      console.error('GetEventsController error:', error)
      return serverError()
    }
  }
}
