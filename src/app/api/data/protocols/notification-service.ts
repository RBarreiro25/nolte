export interface EventCreatedParams {
  eventId: string
  title: string
}

export interface StatusChangedParams {
  eventId: string
  title: string
  oldStatus: string
  newStatus: string
}

export interface NotificationService {
  sendEventCreated: (params: EventCreatedParams) => Promise<void>
  sendEventStatusChanged: (params: StatusChangedParams) => Promise<void>
}
