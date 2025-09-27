import { CreateEvent, CreateEventRequest, CreateEventResponse } from '../../domain/usecases/create-event'
import { CreateEventRepository } from '../protocols/event-repository'
import { NotificationService } from '../protocols/notification-service'

export class DbCreateEvent implements CreateEvent {
  constructor(
    private readonly eventRepository: CreateEventRepository,
    private readonly notificationService: NotificationService
  ) {}

  async handle(params: CreateEventRequest): Promise<CreateEventResponse> {
    const event = await this.eventRepository.create(params)
    
    await this.notificationService.sendEventCreated({
      eventId: event.id,
      title: event.title
    })
    
    return { event, success: true }
  }
}
