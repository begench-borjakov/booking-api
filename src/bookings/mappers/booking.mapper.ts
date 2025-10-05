import type { BookingEntity } from '../../database/entities/booking.entity'
import { BookingResponse } from '../rto/booking.response'

export const toBookingResponse = (b: BookingEntity): BookingResponse => ({
  id: b.id,
  event_id: b.eventId,
  user_id: b.userId,
  created_at: b.createdAt.toISOString(),
})
