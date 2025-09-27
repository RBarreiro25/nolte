import { v4 as uuidv4 } from 'uuid'
import { EventModel, EventStatus } from '../../domain/models/event-model'
import { CreateEventRepository, FindEventRepository, UpdateEventRepository, CreateEventParams, EventFilters, EventQueryResult, UpdateEventParams } from '../../data/protocols/event-repository'

export class InMemoryEventRepository implements CreateEventRepository, FindEventRepository, UpdateEventRepository {
  private events: EventModel[] = []

  async create(params: CreateEventParams): Promise<EventModel> {
    const event: EventModel = {
      ...params,
      id: uuidv4(),
      status: (params.status as EventStatus) || 'DRAFT',
      isUpcoming: new Date(params.startAt) > new Date(),
      updatedAt: new Date().toISOString()
    }
    
    this.events.push(event)
    return event
  }

  async findById(id: string): Promise<EventModel | null> {
    return this.events.find(event => event.id === id) || null
  }

  async findAll(filters: EventFilters): Promise<EventQueryResult> {
    let filteredEvents = [...this.events]

    if (filters.status) {
      const statusList = filters.status.split(',').map(s => s.trim())
      filteredEvents = filteredEvents.filter(event => statusList.includes(event.status))
    }

    if (filters.locations) {
      const locationList = filters.locations.split(',').map(loc => loc.trim().toLowerCase())
      filteredEvents = filteredEvents.filter(event => 
        locationList.some(loc => event.location.toLowerCase().includes(loc))
      )
    }

    if (filters.dateFrom) {
      filteredEvents = filteredEvents.filter(event =>
        new Date(event.startAt) >= new Date(filters.dateFrom!)
      )
    }

    if (filters.dateTo) {
      filteredEvents = filteredEvents.filter(event =>
        new Date(event.endAt) <= new Date(filters.dateTo!)
      )
    }

    filteredEvents = filteredEvents.map(event => ({
      ...event,
      isUpcoming: new Date(event.startAt) > new Date()
    }))

    const total = filteredEvents.length
    if (!filters.page && !filters.limit) {
      return { events: filteredEvents, total }
    }
    
    const page = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

    return { events: paginatedEvents, total }
  }

  async update(params: UpdateEventParams): Promise<EventModel> {
    const eventIndex = this.events.findIndex(event => event.id === params.id)
    if (eventIndex === -1) {
      throw new Error('Event not found')
    }

    const updatedEvent = {
      ...this.events[eventIndex],
      status: params.status !== undefined ? params.status as EventStatus : this.events[eventIndex].status,
      internalNotes: params.internalNotes !== undefined ? params.internalNotes : this.events[eventIndex].internalNotes,
      updatedAt: new Date().toISOString(),
      isUpcoming: new Date(this.events[eventIndex].startAt) > new Date()
    }

    this.events[eventIndex] = updatedEvent
    return updatedEvent
  }
}
