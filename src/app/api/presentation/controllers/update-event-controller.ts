import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { UpdateEvent, UpdateEventRequest } from '../../domain/usecases/update-event'
import { ok, badRequest, unauthorized, notFound, serverError } from '../helpers/http-helper'
import { createValidationError, createNotFoundError } from '../helpers/error-response'
import { updateEventSchema } from '../../infra/validators/zod-schemas'
import { AuthMiddleware } from '../../main/middlewares/auth-middleware'

export class UpdateEventController implements Controller {
  constructor(
    private readonly updateEvent: UpdateEvent,
    private readonly authMiddleware: AuthMiddleware
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const authHeader = httpRequest.headers?.authorization?.replace('Bearer ', '') || ''
      const authResult = await this.authMiddleware.handle(authHeader)
      
      if (authResult.error) {
        return unauthorized()
      }

      const { id } = httpRequest.params || {}
      if (!id) {
        return badRequest(createValidationError([{ field: 'id', message: 'Event ID is required' }]))
      }

      const validation = updateEventSchema.safeParse(httpRequest.body)
      if (!validation.success) {
        const details = validation.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return badRequest(createValidationError(details))
      }

      const result = await this.updateEvent.handle({
        id,
        ...validation.data,
        updatedBy: authResult.accountId
      } as UpdateEventRequest)

      return ok(result.event)
    } catch (error) {
      console.error('UpdateEventController error:', error)
      const errorMessage = (error as Error).message
      
      if (errorMessage === 'Event not found') {
        return notFound(createNotFoundError('Event'))
      }
      
      if (errorMessage.includes('Cannot move from') || errorMessage.includes('can only be') || errorMessage.includes('cannot be changed')) {
        return badRequest(createValidationError([
          { field: 'status', message: errorMessage }
        ]))
      }
      
      return serverError()
    }
  }
}
