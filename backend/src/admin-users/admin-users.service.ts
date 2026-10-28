import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    status?: string,
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const where = {
      role: 'PLAYER' as const,
      ...(search?.trim()
        ? {
            OR: [
              {
                name: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
              {
                email: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
      ...(status === 'active'
        ? { isActive: true }
        : status === 'inactive'
          ? { isActive: false }
          : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          orderBy: { lastUsedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            lastUsedAt: true,
            expiresAt: true,
          },
        },
        playerCases: {
          orderBy: { lastActivityAt: 'desc' },
          include: {
            gameCase: {
              select: {
                id: true,
                caseNumber: true,
                title: true,
                priceInPaise: true,
                coverImageUrl: true,
              },
            },
            discoveries: {
              include: {
                clue: true,
              },
            },
            attempts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lastLogin = user.sessions[0]?.lastUsedAt || user.sessions[0]?.createdAt || null;

    return {
      ...user,
      lastLogin,
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const data = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.email !== undefined
        ? { email: dto.email.trim().toLowerCase() }
        : {}),
      ...(dto.isActive !== undefined
        ? { isActive: dto.isActive }
        : {}),
    };

    if (!Object.keys(data).length) {
      throw new ConflictException('Provide at least one field to update');
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          emailVerifiedAt: true,
          updatedAt: true,
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error
      ) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }

        if (error.code === 'P2002') {
          throw new ConflictException(
            'That email address is already in use',
          );
        }
      }

      throw error;
    }
  }

  async remove(id: string, adminId: string) {
    if (id === adminId) {
      throw new ConflictException(
        'You cannot delete your own admin account',
      );
    }

    try {
      await this.prisma.user.delete({ where: { id } });
      return { message: 'User deleted successfully' };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }
}