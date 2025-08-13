import { UserRepository, PaginationOptions, PaginatedResult } from '../../domain/repositories/UserRepository';
import { UserEntity, CreateUserEntity, UpdateUserEntity } from '../../domain/entities/User';
import { prisma } from '@config/prisma';

export class PrismaUserRepository implements UserRepository {
  async findAll(options: PaginationOptions, search?: string): Promise<PaginatedResult<UserEntity>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated data
    const users = await prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      data: users.map((u: any) => ({ ...u, role: 'user' as const })),
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

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? { ...user, role: 'user' } : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user ? { ...user, role: 'user' } : null;
  }

  async create(userData: CreateUserEntity): Promise<UserEntity> {
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        // Note: In a real app, you'd hash the password here
        // password: await bcrypt.hash(userData.password, 10),
      },
    });
    return { ...user, role: userData.role ?? 'user' };
  }

  async update(id: string, userData: UpdateUserEntity): Promise<UserEntity | null> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: userData,
      });
      return { ...user, role: userData.role ?? 'user' };
    } catch (error) {
      // If user not found, Prisma throws an error
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }
}
