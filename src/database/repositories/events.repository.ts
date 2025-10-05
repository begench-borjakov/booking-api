import { PrismaClient, Prisma } from '@prisma/client'
import { EventEntity } from '../entities/event.entity'

type Tx = Prisma.TransactionClient
type DbClient = PrismaClient | Tx

export class PrismaEventsRepository {
  constructor(private readonly prisma: DbClient) {}

  // общий маппер
  private toEntity(e: { id: number; name: string; totalSeats: number }): EventEntity {
    return { id: e.id, name: e.name, totalSeats: e.totalSeats }
  }

  async findById(id: number): Promise<EventEntity | null> {
    const e = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true, totalSeats: true },
    })
    return e ? this.toEntity(e) : null
  }

  // Стандартная блокировка (ждёт, если занято)
  async findByIdForUpdate(id: number): Promise<EventEntity | null> {
    const rows = await this.prisma.$queryRaw<
      { id: number; name: string; total_seats: number }[]
    >`SELECT id, name, total_seats FROM events WHERE id = ${id} FOR UPDATE`
    if (!rows.length) return null
    const r = rows[0]
    return this.toEntity({ id: r.id, name: r.name, totalSeats: r.total_seats })
  }

  // Не ждать блокировку (сразу ошибка, если занято)
  async findByIdForUpdateNowait(id: number): Promise<EventEntity | null> {
    const rows = await this.prisma.$queryRaw<
      { id: number; name: string; total_seats: number }[]
    >`SELECT id, name, total_seats FROM events WHERE id = ${id} FOR UPDATE NOWAIT`
    if (!rows.length) return null
    const r = rows[0]
    return this.toEntity({ id: r.id, name: r.name, totalSeats: r.total_seats })
  }

  async findByIdForUpdateSkipLocked(id: number): Promise<EventEntity | null> {
    const rows = await this.prisma.$queryRaw<
      { id: number; name: string; total_seats: number }[]
    >`SELECT id, name, total_seats FROM events WHERE id = ${id} FOR UPDATE SKIP LOCKED`
    if (!rows.length) return null
    const r = rows[0]
    return this.toEntity({ id: r.id, name: r.name, totalSeats: r.total_seats })
  }

  async create(name: string, totalSeats: number): Promise<EventEntity> {
    const e = await this.prisma.event.create({
      data: { name, totalSeats },
      select: { id: true, name: true, totalSeats: true },
    })
    return this.toEntity(e)
  }

  async findAll(): Promise<EventEntity[]> {
    const list = await this.prisma.event.findMany({
      select: { id: true, name: true, totalSeats: true },
      orderBy: { id: 'asc' },
    })
    return list.map(this.toEntity)
  }
}
