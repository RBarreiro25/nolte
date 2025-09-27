import { UpdateEvent, UpdateEventRequest, UpdateEventResponse } from '../../domain/usecases/update-event'
import { UpdateEventRepository, FindEventRepository } from '../protocols/event-repository'
import { NotificationService } from '../protocols/notification-service'

export class DbUpdateEvent implements UpdateEvent {
  constructor(
    private readonly eventRepository: UpdateEventRepository,
    private readonly findRepository: FindEventRepository,
    private readonly notificationService: NotificationService
  ) {}

  async handle(params: UpdateEventRequest): Promise<UpdateEventResponse> {
    const oldEvent = await this.getEventById(params.id)
    this.validateStatusTransition(oldEvent.status, params.status)
    
    const event = await this.eventRepository.update(params)
    
    const statusChanged = oldEvent.status !== event.status
    if (statusChanged) {
      await this.handleStatusChange(oldEvent.status, event.status, event.title, event.id)
    }
    
    return { event, success: true, statusChanged }
  }

  private validateStatusTransition(currentStatus: string, newStatus?: string): void {
    if (!newStatus) return
    if (currentStatus === newStatus) return
    if ((currentStatus === 'PUBLISHED' || currentStatus === 'CANCELLED') && newStatus === 'DRAFT') {
      throw new Error('Cannot move from PUBLISHED/CANCELLED back to DRAFT')
    }
    if (currentStatus === 'PUBLISHED' && newStatus !== 'CANCELLED') {
      throw new Error('PUBLISHED events can only be CANCELLED')
    }
    if (currentStatus === 'CANCELLED') {
      throw new Error('CANCELLED events cannot be changed')
    }
    if (currentStatus === 'DRAFT' && newStatus !== 'PUBLISHED' && newStatus !== 'CANCELLED') {
      throw new Error('DRAFT events can only be PUBLISHED or CANCELLED')
    }
  }
  
  private async getEventById(id: string) {
    const event = await this.findRepository.findById(id)
    if (!event) throw new Error('Event not found')
    return event
  }

  private async handleStatusChange(oldStatus: string, newStatus: string, title: string, eventId: string): Promise<void> {
    if (oldStatus === 'DRAFT' && newStatus === 'PUBLISHED') {
      console.log(`Event published: ${title}`)
    }
    if (newStatus === 'CANCELLED') {
      console.log(`Event cancelled: ${title}`)
    }

    await this.notificationService.sendEventStatusChanged({
      eventId,
      title,
      oldStatus,
      newStatus
    })
  }
}
