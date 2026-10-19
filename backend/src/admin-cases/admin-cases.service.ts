import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { CreateCaseDto } from './dto/create-case.dto.js';
import { errorMonitor } from 'events';
import { throwError } from 'rxjs';
import { UpdateCaseDto } from './dto/update-case.dto.js';
import { CreateSuspectDto } from './dto/create-suspect.dto.js';
import { UpdateSuspectDto } from './dto/update-suspect.dto.js';

@Injectable()
export class AdminCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  async create(dto: CreateCaseDto) {
    let suppliedUrl: URL;
    try {
      suppliedUrl = new URL(dto.coverImageUrl);
    } catch {
      throw new BadRequestException('Invalid cover image URL');
    }

    const endpoint = this.config.get<string>('IMAGEKIT_URL_ENDPOINT');
    const expectedHost = endpoint ? new URL(endpoint).hostname : null;
    const isCloudinary = suppliedUrl.hostname.includes('cloudinary.com');
    const isExpectedHost =
      expectedHost && suppliedUrl.hostname === expectedHost;

    if (
      suppliedUrl.protocol !== 'https:' ||
      (!isCloudinary && !isExpectedHost)
    ) {
      throw new ConflictException(
        'Cover image must be hosted on Cloudinary or your configured media endpoint',
      );
    }
    try {
      return await this.prisma.gameCase.create({
        data: {
          caseNumber: dto.caseNumber,
          title: dto.title,
          description: dto.description,
          coverImageUrl: dto.coverImageUrl,
          priceInPaise: dto.priceInRupees * 100,
          isPublished: false,
        },
        select: {
          id: true,
          title: true,
          description: true,
          coverImageUrl: true,
          priceInPaise: true,
          isPublished: true,
          createdAt: true,
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A case with this case number already exists.',
        );
      }
      throw error;
    }
  }
  async findAll(page = 1, limit = 20, search?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const where = search?.trim()
      ? {
          OR: [
            {
              title: {
                contains: search.trim(),
                mode: 'insensitive' as const,
              },
            },
            {
              caseNumber: Number.isInteger(Number(search))
                ? Number(search)
                : undefined,
            },
          ],
        }
      : {};

    const [cases, total] = await this.prisma.$transaction([
      this.prisma.gameCase.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { caseNumber: 'asc' },
      }),
      this.prisma.gameCase.count({ where }),
    ]);

    return {
      data: cases.map((item) => ({
        ...item,
        priceInRupees: item.priceInPaise / 100,
      })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
  async update(id: string, dto: UpdateCaseDto) {
    const data = {
      ...(dto.caseNumber !== undefined ? { caseNumber: dto.caseNumber } : {}),
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
      ...(dto.coverImageUrl !== undefined
        ? { coverImageUrl: dto.coverImageUrl }
        : {}),
      ...(dto.priceInRupees !== undefined
        ? { priceInPaise: dto.priceInRupees * 100 }
        : {}),
    };

    if (!Object.keys(data).length) {
      throw new BadRequestException('Provide at least one field to update');
    }

    // Validate replacement image URLs against Cloudinary or configured host
    if (dto.coverImageUrl !== undefined) {
      let suppliedUrl: URL;

      try {
        suppliedUrl = new URL(dto.coverImageUrl);
      } catch {
        throw new BadRequestException('Invalid cover image URL');
      }

      const endpoint = this.config.get<string>('IMAGEKIT_URL_ENDPOINT');
      const expectedHost = endpoint ? new URL(endpoint).hostname : null;
      const isCloudinary = suppliedUrl.hostname.includes('cloudinary.com');
      const isExpectedHost =
        expectedHost && suppliedUrl.hostname === expectedHost;

      if (
        suppliedUrl.protocol !== 'https:' ||
        (!isCloudinary && !isExpectedHost)
      ) {
        throw new BadRequestException(
          'Cover image must use Cloudinary or your configured media endpoint',
        );
      }

      data.coverImageUrl = suppliedUrl.toString();
    }

    try {
      const updated = await this.prisma.gameCase.update({
        where: { id },
        data,
      });

      return {
        ...updated,
        priceInRupees: updated.priceInPaise / 100,
      };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Case not found');
        }

        if (error.code === 'P2002') {
          throw new ConflictException(
            'A case with this case number already exists',
          );
        }
      }

      throw error;
    }
  }
  async setPublished(id: string, isPublished: boolean) {
    try {
      const updated = await this.prisma.gameCase.update({
        where: { id },
        data: { isPublished },
      });

      return {
        id: updated.id,
        caseNumber: updated.caseNumber,
        title: updated.title,
        isPublished: updated.isPublished,
        message: isPublished
          ? 'Case published successfully'
          : 'Case unpublished successfully',
      };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Case not found');
      }

      throw error;
    }
  }
  async remove(id: string) {
    try {
      await this.prisma.gameCase.delete({
        where: { id },
      });

      return { message: 'Case deleted successfully' };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Case not found');
      }

      throw error;
    }
  }
  async findOne(id: string) {
    const item = await this.prisma.gameCase.findFirst({
      where: {
        id,
        isPublished: true,
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        description: true,
        coverImageUrl: true,
        priceInPaise: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Case not found');
    }

    return {
      ...item,
      priceInRupees: item.priceInPaise / 100,
      isFree: item.priceInPaise === 0,
      priceInPaise: undefined,
    };
  }

  async createSuspect(caseId: string, dto: CreateSuspectDto) {
    const gameCase = await this.prisma.gameCase.findUnique({
      where: { id: caseId },
      select: { id: true, title: true },
    });

    if (!gameCase) {
      throw new NotFoundException('Case not found');
    }

    const suspect = await this.prisma.caseSuspect.create({
      data: {
        gameCaseId: caseId,
        name: dto.name.trim(),
        photoUrl: dto.photoUrl?.trim() || null,
        relationship: dto.relationship.trim(),
        description: dto.description.trim(),
        claimedAlibi: dto.claimedAlibi.trim(),
        connections: dto.connections?.trim() || '',
        sortOrder: dto.sortOrder ?? 0,
        isInitiallyUnlocked: dto.isInitiallyUnlocked ?? false,
      },
      select: {
        id: true,
        gameCaseId: true,
        name: true,
        photoUrl: true,
        relationship: true,
        description: true,
        claimedAlibi: true,
        connections: true,
        sortOrder: true,
        isInitiallyUnlocked: true,
      },
    });

    return {
      message: 'Suspect created successfully',
      caseTitle: gameCase.title,
      suspect,
    };
  }

  async getSuspects(caseId: string) {
    const gameCase = await this.prisma.gameCase.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!gameCase) {
      throw new NotFoundException('Case not found');
    }

    const suspects = await this.prisma.caseSuspect.findMany({
      where: {
        gameCaseId: caseId,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        gameCaseId: true,
        name: true,
        photoUrl: true,
        relationship: true,
        description: true,
        claimedAlibi: true,
        connections: true,
        sortOrder: true,
        isInitiallyUnlocked: true,
      },
    });

    return {
      caseId: gameCase.id,
      caseTitle: gameCase.title,
      total: suspects.length,
      suspects,
    };
  }

  async updateSuspect(suspectId: string, dto: UpdateSuspectDto) {
    const existing = await this.prisma.caseSuspect.findUnique({
      where: { id: suspectId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Suspect not found');
    }

    const data = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.photoUrl !== undefined
        ? { photoUrl: dto.photoUrl.trim() || null }
        : {}),
      ...(dto.relationship !== undefined
        ? { relationship: dto.relationship.trim() }
        : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
      ...(dto.claimedAlibi !== undefined
        ? { claimedAlibi: dto.claimedAlibi.trim() }
        : {}),
      ...(dto.connections !== undefined
        ? { connections: dto.connections.trim() }
        : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      ...(dto.isInitiallyUnlocked !== undefined
        ? { isInitiallyUnlocked: dto.isInitiallyUnlocked }
        : {}),
    };

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Provide at least one field to update');
    }

    const updated = await this.prisma.caseSuspect.update({
      where: { id: suspectId },
      data,
      select: {
        id: true,
        gameCaseId: true,
        name: true,
        photoUrl: true,
        relationship: true,
        description: true,
        claimedAlibi: true,
        connections: true,
        sortOrder: true,
        isInitiallyUnlocked: true,
      },
    });

    return {
      message: 'Suspect updated successfully',
      suspect: updated,
    };
  }

  
async deleteSuspect(suspectId: string) {
  const suspect = await this.prisma.caseSuspect.findUnique({
    where: { id: suspectId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!suspect) {
    throw new NotFoundException('Suspect not found');
  }

  const [
    interviewThreads,
    assessments,
    playerUnlocks,
    selectedIn,
    solutionFor,
  ] = await Promise.all([
    this.prisma.interviewThread.count({
      where: { suspectId },
    }),
    this.prisma.suspectAssessment.count({
      where: { suspectId },
    }),
    this.prisma.playerSuspectUnlock.count({
      where: { suspectId },
    }),
    this.prisma.caseAttempt.count({
      where: { suspectId },
    }),
    this.prisma.caseSolution.count({
      where: { correctSuspectId: suspectId },
    }),
  ]);

  if (
    interviewThreads > 0 ||
    assessments > 0 ||
    playerUnlocks > 0 ||
    selectedIn > 0 ||
    solutionFor > 0
  ) {
    throw new BadRequestException(
      'Cannot delete this suspect because it is already used in interviews or game progress. Update the suspect instead.',
    );
  }

  await this.prisma.caseSuspect.delete({
    where: { id: suspectId },
  });

  return {
    message: 'Suspect deleted successfully',
    suspectId,
    name: suspect.name,
  };
}

}
