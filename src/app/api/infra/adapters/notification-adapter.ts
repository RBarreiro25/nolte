import { NotificationService, EventCreatedParams, StatusChangedParams } from '../../data/protocols/notification-service'

export class ConsoleNotificationAdapter implements NotificationService {
  async sendEventCreated(params: EventCreatedParams): Promise<void> {
    console.log(`New event created: ${params.title}`)
  }

  async sendEventStatusChanged(params: StatusChangedParams): Promise<void> {
    console.log(`[NOTIFICATION] Event "${params.title}" status changed: ${params.oldStatus} → ${params.newStatus} (ID: ${params.eventId})`)
  }
}
