import { EventEntity } from '../../database/events/event.entity'
import { EventResponse } from '../rto/event.response'

export const toEventResponse = (e: EventEntity): EventResponse => ({
  id: e.id,
  name: e.name,
  total_seats: e.totalSeats,
  created_at: e.createdAt.toISOString(),
  updated_at: e.updatedAt.toISOString(),
})

export const toEventsResponse = (items: EventEntity[]): EventResponse[] =>
  items.map(toEventResponse)
