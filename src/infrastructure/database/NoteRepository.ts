import { NoteRepository, NoteEntity, CreateNoteEntity, UpdateNoteEntity } from '../../domain/repositories/NoteRepository';
import { PaginationOptions, PaginatedResult } from '../../domain/repositories/UserRepository';
import { prisma } from '@config/prisma';

export class PrismaNoteRepository implements NoteRepository {
  async findAll(options: PaginationOptions, userId?: string): Promise<PaginatedResult<NoteEntity>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = userId ? { userId } : {};

    // Get total count
    const total = await prisma.note.count({ where });

    // Get paginated data
    const notes = await prisma.note.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<NoteEntity | null> {
    return await prisma.note.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string, options: PaginationOptions): Promise<PaginatedResult<NoteEntity>> {
    return this.findAll(options, userId);
  }

  async create(noteData: CreateNoteEntity): Promise<NoteEntity> {
    return await prisma.note.create({
      data: noteData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, noteData: UpdateNoteEntity): Promise<NoteEntity | null> {
    try {
      return await prisma.note.update({
        where: { id },
        data: noteData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.note.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
