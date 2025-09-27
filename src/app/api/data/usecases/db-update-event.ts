import { UpdateEvent, UpdateEventRequest, UpdateEventResponse } from '../../domain/usecases/update-event'
import { UpdateEventRepository, FindEventRepository } from '../protocols/event-repository'
import { NotificationService } from '../protocols/notification-service'
import { CacheService } from '../protocols/cache-service'
import { EventModel } from '../../domain/models/event-model'

export class DbUpdateEvent implements UpdateEvent {
  constructor(
    private readonly eventRepository: UpdateEventRepository,
    private readonly findRepository: FindEventRepository,
    private readonly notificationService: NotificationService,
    private readonly cacheService: CacheService
  ) {}

  async handle(params: UpdateEventRequest): Promise<UpdateEventResponse> {
    const oldEvent = await this.getEventById(params.id)
    this.validateStatusTransition(oldEvent.status, params.status)
    
    const event = await this.eventRepository.update(params)
    
    const statusChanged = oldEvent.status !== event.status
    if (statusChanged) {
      await this.handleStatusChange(oldEvent.status, event.status, event.title, event.id)
    }
    await this.invalidateCacheIfNeeded(oldEvent, event)
    
    return { event, success: true, statusChanged }
  }

  private validateStatusTransition(currentStatus: string, newStatus?: string): void {
    if (!newStatus) return
    if ((currentStatus === 'PUBLISHED' || currentStatus === 'CANCELLED') && newStatus === 'DRAFT') {
      throw new Error('Cannot move from PUBLISHED/CANCELLED back to DRAFT')
    }
    if (currentStatus === 'PUBLISHED' && newStatus !== 'CANCELLED' && newStatus !== 'PUBLISHED') {
      throw new Error('PUBLISHED events can only be CANCELLED')
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

  private async invalidateCacheIfNeeded(oldEvent: EventModel, newEvent: EventModel): Promise<void> {
    const fieldsChanged = 
      oldEvent.title !== newEvent.title ||
      oldEvent.location !== newEvent.location ||
      oldEvent.startAt !== newEvent.startAt ||
      oldEvent.endAt !== newEvent.endAt

    if (fieldsChanged) {
      // Generate cache keys for both old and new event data
      const oldCacheKey = this.generateCacheKey(oldEvent.title, oldEvent.location, oldEvent.startAt, oldEvent.endAt)
      const newCacheKey = this.generateCacheKey(newEvent.title, newEvent.location, newEvent.startAt, newEvent.endAt)
      
      // Delete both cache entries
      await this.cacheService.delete(oldCacheKey)
      if (oldCacheKey !== newCacheKey) {
        await this.cacheService.delete(newCacheKey)
      }
      
      console.log(`[CACHE] Invalidated cache for event ${newEvent.id} due to field changes`)
    }
  }

  private generateCacheKey(title: string, location: string, startAt: string, endAt: string): string {
    const data = { title, location, startAt, endAt }
    return Buffer.from(JSON.stringify(data)).toString('base64')
  }
}
