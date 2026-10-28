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
import { CreateInterviewThreadDto } from './dto/create-interview-thread.dto.js';
import { CreateInterviewResponseDto } from './dto/create-interview-response.dto.js';
import { CreateInterviewResponseUnlockDto } from './dto/create-interview-response-unlock.dto.js';
import { UpdateInterviewResponseUnlockDto } from './dto/update-interview-response-unlock.dto.js';
import { CreateCaseLeadDto } from './dto/create-case-lead.dto.js';
import { CreateCaseHintDto } from './dto/create-case-hint.dto.js';
import { UpdateCaseHintDto } from './dto/update-case-hint.dto.js';
import { UpsertCaseSolutionDto } from './dto/upsert-case-solution.dto.js';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';
import { CreateClueDto } from './dto/create-clue.dto.js';
import { UpdateClueDto } from './dto/update-clue.dto.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { UpsertCaseVictimDto } from './dto/upsert-case-victim.dto.js';
import { UpsertPoliceReportDto } from './dto/upsert-police-report.dto.js';
import { UpdateInterviewThreadDto } from './dto/update-interview-thread.dto.js';
import { UpdateInterviewResponseDto } from './dto/update-interview-response.dto.js';
import { CreateCaseBundleDto } from './dto/create-case-bundle.dto.js';
@Injectable()
export class AdminCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createBundle(dto: CreateCaseBundleDto) {
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
      return await this.prisma.$transaction(async (tx) => {
        // 1. Create main GameCase
        const newCase = await tx.gameCase.create({
          data: {
            caseNumber: dto.caseNumber,
            title: dto.title.trim(),
            description: dto.description.trim(),
            coverImageUrl: dto.coverImageUrl.trim(),
            priceInPaise: (dto.priceInRupees || 0) * 100,
            isPublished: dto.isPublished ?? false,
          },
        });

        // 2. Create Victim if provided
        if (dto.victim) {
          await tx.caseVictim.create({
            data: {
              gameCaseId: newCase.id,
              name: dto.victim.name.trim(),
              age: dto.victim.age,
              occupation: dto.victim.occupation.trim(),
              dateOfDeath: new Date(dto.victim.dateOfDeath),
              placeOfDeath: dto.victim.placeOfDeath.trim(),
              biography: dto.victim.biography?.trim() || null,
            },
          });
        }

        // 3. Create Police Report if provided
        if (dto.policeReport) {
          await tx.policeReport.create({
            data: {
              gameCaseId: newCase.id,
              causeOfDeath: dto.policeReport.causeOfDeath.trim(),
              officerNotes: dto.policeReport.officerNotes.trim(),
              timeOfDeathStart: dto.policeReport.timeOfDeathStart
                ? new Date(dto.policeReport.timeOfDeathStart)
                : null,
              timeOfDeathEnd: dto.policeReport.timeOfDeathEnd
                ? new Date(dto.policeReport.timeOfDeathEnd)
                : null,
              isPublished: dto.policeReport.isPublished ?? true,
            },
          });
        }

        // 4. Create Locations with Clues and Documents
        if (dto.locations && dto.locations.length > 0) {
          for (let lIdx = 0; lIdx < dto.locations.length; lIdx++) {
            const loc = dto.locations[lIdx];
            const createdLoc = await tx.caseLocation.create({
              data: {
                gameCaseId: newCase.id,
                name: loc.name.trim(),
                description: loc.description.trim(),
                imageUrl: loc.imageUrl?.trim() || null,
                mapX: loc.mapX ?? 50,
                mapY: loc.mapY ?? 50,
                isInitiallyOpen: loc.isInitiallyOpen ?? true,
                isDeadEnd: loc.isDeadEnd ?? false,
                sortOrder: lIdx,
              },
            });

            if (loc.clues && loc.clues.length > 0) {
              for (let cIdx = 0; cIdx < loc.clues.length; cIdx++) {
                const clue = loc.clues[cIdx];
                await tx.caseClue.create({
                  data: {
                    locationId: createdLoc.id,
                    title: clue.title.trim(),
                    description: clue.description.trim(),
                    imageUrl: clue.imageUrl?.trim() || null,
                    sortOrder: cIdx,
                  },
                });
              }
            }

            if (loc.documents && loc.documents.length > 0) {
              for (let dIdx = 0; dIdx < loc.documents.length; dIdx++) {
                const doc = loc.documents[dIdx];
                await tx.caseDocument.create({
                  data: {
                    locationId: createdLoc.id,
                    title: doc.title.trim(),
                    description: doc.description.trim(),
                    content: doc.content?.trim() || null,
                    sortOrder: dIdx,
                  },
                });
              }
            }
          }
        }

        // 5. Create Suspects and Interview Threads
        const createdSuspects: { id: string; name: string }[] = [];
        if (dto.suspects && dto.suspects.length > 0) {
          for (let sIdx = 0; sIdx < dto.suspects.length; sIdx++) {
            const s = dto.suspects[sIdx];
            const createdSuspect = await tx.caseSuspect.create({
              data: {
                gameCaseId: newCase.id,
                name: s.name.trim(),
                relationship: s.relationship.trim(),
                description: s.description.trim(),
                claimedAlibi: s.claimedAlibi.trim(),
                photoUrl: s.photoUrl?.trim() || null,
                connections: s.connections?.trim() || '',
                isInitiallyUnlocked: s.isInitiallyUnlocked ?? true,
                sortOrder: sIdx,
              },
            });
            createdSuspects.push({ id: createdSuspect.id, name: createdSuspect.name });

            if (s.threads && s.threads.length > 0) {
              for (let tIdx = 0; tIdx < s.threads.length; tIdx++) {
                const thread = s.threads[tIdx];
                const createdThread = await tx.interviewThread.create({
                  data: {
                    suspectId: createdSuspect.id,
                    topic: thread.topic.trim(),
                    question: thread.question.trim(),
                    visitNumber: thread.visitNumber ?? 1,
                    isInitiallyAvailable: thread.isInitiallyAvailable ?? true,
                    sortOrder: tIdx,
                  },
                });

                if (thread.responses && thread.responses.length > 0) {
                  for (let rIdx = 0; rIdx < thread.responses.length; rIdx++) {
                    const resp = thread.responses[rIdx];
                    await tx.interviewResponse.create({
                      data: {
                        threadId: createdThread.id,
                        responseText: resp.responseText.trim(),
                        isNervous: resp.isNervous ?? false,
                        internalNotes: resp.internalNotes?.trim() || null,
                        sortOrder: rIdx,
                      },
                    });
                  }
                }
              }
            }
          }
        }

        // 6. Create Case Solution
        if (dto.solution) {
          let targetSuspectId = dto.solution.correctSuspectId;
          if (
            !targetSuspectId &&
            dto.solution.correctSuspectIndex !== undefined &&
            createdSuspects[dto.solution.correctSuspectIndex]
          ) {
            targetSuspectId = createdSuspects[dto.solution.correctSuspectIndex].id;
          } else if (!targetSuspectId && createdSuspects.length > 0) {
            targetSuspectId = createdSuspects[0].id;
          }

          if (targetSuspectId) {
            await tx.caseSolution.create({
              data: {
                gameCaseId: newCase.id,
                correctSuspectId: targetSuspectId,
                motive: dto.solution.motive.trim(),
                method: dto.solution.method.trim(),
                explanation: dto.solution.explanation.trim(),
                epilogue: dto.solution.epilogue.trim(),
                motiveKeywords: dto.solution.motiveKeywords ?? [],
                methodKeywords: dto.solution.methodKeywords ?? [],
              },
            });
          }
        }

        return {
          id: newCase.id,
          caseNumber: newCase.caseNumber,
          title: newCase.title,
          description: newCase.description,
          coverImageUrl: newCase.coverImageUrl,
          priceInPaise: newCase.priceInPaise,
          priceInRupees: newCase.priceInPaise / 100,
          isPublished: newCase.isPublished,
          createdAt: newCase.createdAt,
        };
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
          caseNumber: true,
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
  
async validateCaseForPublishing(caseId: string) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    include: {
      victim: true,
      policeReport: true,
      suspects: {
        include: {
          threads: {
            include: {
              responses: true,
            },
          },
        },
      },
      locations: {
        include: {
          clues: true,
          documents: true,
          leadsFrom: true,
        },
      },
      solution: true,
      hints: true,
    },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!gameCase.title?.trim()) {
    errors.push('Case title is required.');
  }

  if (!gameCase.description?.trim()) {
    errors.push('Case description is required.');
  }

  if (!gameCase.coverImageUrl?.trim()) {
    errors.push('Case cover image is required.');
  }

  if (!gameCase.victim) {
    errors.push('Victim information is missing.');
  }

  if (!gameCase.policeReport) {
    errors.push('Police report is missing.');
  } else {
    const report = gameCase.policeReport;

    if (!report.causeOfDeath.trim()) {
      errors.push('Police report cause of death is required.');
    }

    if (!report.officerNotes.trim()) {
      errors.push('Police officer notes are required.');
    }

    if (
      report.timeOfDeathStart &&
      report.timeOfDeathEnd &&
      report.timeOfDeathEnd < report.timeOfDeathStart
    ) {
      errors.push(
        'Police report time-of-death end must not precede its start.',
      );
    }

    if (!report.isPublished) {
      warnings.push('Police report is not published.');
    }
  }

  if (gameCase.suspects.length < 2) {
    errors.push('At least two suspects are required.');
  }

  for (const suspect of gameCase.suspects) {
    if (suspect.threads.length === 0) {
      warnings.push(
        `Suspect "${suspect.name}" has no interview questions.`,
      );
      continue;
    }

    const hasResponse = suspect.threads.some(
      (thread) => thread.responses.length > 0,
    );

    if (!hasResponse) {
      warnings.push(
        `Suspect "${suspect.name}" has no interview responses.`,
      );
    }
  }

  if (gameCase.locations.length === 0) {
    errors.push('At least one investigation location is required.');
  }

  const totalClues = gameCase.locations.reduce(
    (count, location) => count + location.clues.length,
    0,
  );

  if (totalClues === 0) {
    errors.push('At least one clue is required.');
  }

  if (!gameCase.locations.some((location) => location.documents.length > 0)) {
    warnings.push('No investigation documents have been added.');
  }

  const totalLeads = gameCase.locations.reduce(
    (count, location) => count + location.leadsFrom.length,
    0,
  );

  if (totalLeads === 0) {
    warnings.push('No leads connect investigation locations.');
  }

  if (!gameCase.solution) {
    errors.push('Case solution is missing.');
  } else {
    const correctSuspectExists = gameCase.suspects.some(
      (suspect) => suspect.id === gameCase.solution!.correctSuspectId,
    );

    if (!correctSuspectExists) {
      errors.push(
        'The solution references a suspect that does not belong to this case.',
      );
    }

    if (!gameCase.solution.motive.trim()) {
      errors.push('Solution motive is required.');
    }

    if (!gameCase.solution.method.trim()) {
      errors.push('Solution method is required.');
    }

    if (!gameCase.solution.explanation.trim()) {
      errors.push('Solution explanation is required.');
    }
  }

  if (gameCase.hints.length === 0) {
    warnings.push('No hints have been configured.');
  }

  return {
    caseId: gameCase.id,
    caseNumber: gameCase.caseNumber,
    title: gameCase.title,
    readyToPublish: errors.length === 0,
    errors,
    warnings,
  };
}

  

async setPublished(id: string, isPublished: boolean) {
  // Confirm the case exists before validating or updating it.
  const existingCase = await this.prisma.gameCase.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingCase) {
    throw new NotFoundException('Case not found');
  }

  // Validate before publishing. Unpublishing remains allowed.
  if (isPublished) {
    const validation = await this.validateCaseForPublishing(id);

    if (!validation.readyToPublish) {
      throw new BadRequestException({
        message: 'Case cannot be published because validation failed.',
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }
  }

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
    const item = await this.prisma.gameCase.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        description: true,
        coverImageUrl: true,
        priceInPaise: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
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
  
async getCasePreview(caseId: string) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    include: {
      victim: true,
      policeReport: true,
      statements: true,
      suspects: {
        include: {
          threads: {
            orderBy: [
              { visitNumber: 'asc' },
              { sortOrder: 'asc' },
            ],
            include: {
              responses: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  unlocks: {
                    include: {
                      clue: true,
                      document: true,
                      location: true,
                      suspect: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      locations: {
        orderBy: { sortOrder: 'asc' },
        include: {
          clues: {
            orderBy: { sortOrder: 'asc' },
          },
          documents: {
            orderBy: { sortOrder: 'asc' },
          },
          leadsFrom: {
            include: {
              destinationLocation: true,
              requiredClue: true,
            },
          },
        },
      },
      hints: {
        orderBy: { hintNumber: 'asc' },
      },
      solution: true,
    },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  return {
    ...gameCase,
    priceInRupees: gameCase.priceInPaise / 100,
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
  async createInterviewThread(suspectId:string,dto:CreateInterviewThreadDto){
    const suspect=await this.prisma.caseSuspect.findUnique({
      where:{id:suspectId},
      select:{
        id:true,
        name:true,
        gameCaseId:true
      }
    })
    if(!suspect){
      throw new NotFoundException('Suspect not found')
    }
    const thread =await this.prisma.interviewThread.create({
      data: {
      suspectId,
      topic: dto.topic.trim(),
      question: dto.question.trim(),
      visitNumber: dto.visitNumber,
      isInitiallyAvailable: dto.isInitiallyAvailable,
      sortOrder: dto.sortOrder,
    },
    select: {
      id: true,
      suspectId: true,
      topic: true,
      question: true,
      visitNumber: true,
      isInitiallyAvailable: true,
      sortOrder: true,
    },
  });
    return {
    message: 'Interview thread created successfully',
    suspect:{
      id:suspect.id,
      name:suspect.name,
      gameCaseId:suspect.gameCaseId
    },
    thread
  };

    
  }

  async createInterviewResponse(threadId:string,dto:CreateInterviewResponseDto){
    const thread=await this.prisma.interviewThread.findUnique({
      where:{id:threadId},
      select:{
        id:true,
        topic:true,
        suspect:{
          select:{
            id:true,
            name:true,
            gameCaseId:true
          }
        }
      }
    })
    if (!thread){
      throw new NotFoundException('Interview thread not found')
    }
    const response =await this.prisma.interviewResponse.create({
      data:{
        threadId,
        responseText:dto.responseText,
        isNervous:dto.isNervous,
        sortOrder:dto.sortOrder,
        internalNotes:dto.internalNotes
      },
      select:{
        id:true,
        threadId:true,
        responseText:true,
        isNervous:true,
        sortOrder:true,
      }
    })
    return {
      message: 'Interview response created successfully',
      suspect:thread.suspect,
      topic:thread.topic,
      response
    };
  }

async getInterviewThreads(suspectId: string) {
  const suspect = await this.prisma.caseSuspect.findUnique({
    where: { id: suspectId },
    select: {
      id: true,
      name: true,
      gameCaseId: true,
    },
  });

  if (!suspect) {
    throw new NotFoundException('Suspect not found');
  }

  const threads = await this.prisma.interviewThread.findMany({
    where: { suspectId },
    orderBy: [
      { visitNumber: 'asc' },
      { sortOrder: 'asc' },
    ],
    select: {
      id: true,
      topic: true,
      question: true,
      visitNumber: true,
      isInitiallyAvailable: true,
      sortOrder: true,
      responses: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          responseText: true,
          isNervous: true,
          sortOrder: true,
        },
      },
    },
  });

  return {
    suspect,
    totalThreads: threads.length,
    threads,
  };
}

async createInterviewResponseUnlock(
  responseId: string,
  dto: CreateInterviewResponseUnlockDto,
) {
  const response = await this.prisma.interviewResponse.findUnique({
    where: { id: responseId },
    select: {
      id: true,
      thread: {
        select: {
          topic: true,
          suspect: {
            select: {
              id: true,
              name: true,
              gameCaseId: true,
            },
          },
        },
      },
    },
  });

  if (!response) {
    throw new NotFoundException('Interview response not found');
  }

  const targetId = dto.targetId;
  let targetName: string;

  switch (dto.type) {
    case 'CLUE': {
      const target = await this.prisma.caseClue.findUnique({
        where: { id: targetId },
        select: { id: true, title: true, location: { select: { gameCaseId: true } } },
      });

      if (!target || target.location.gameCaseId !== response.thread.suspect.gameCaseId) {
        throw new BadRequestException('Clue not found in this case');
      }

      targetName = target.title;
      break;
    }

    case 'DOCUMENT': {
      const target = await this.prisma.caseDocument.findUnique({
        where: { id: targetId },
        select: { id: true, title: true, location: { select: { gameCaseId: true } } },
      });

      if (!target || target.location.gameCaseId !== response.thread.suspect.gameCaseId) {
        throw new BadRequestException('Document not found in this case');
      }

      targetName = target.title;
      break;
    }

    case 'LOCATION': {
      const target = await this.prisma.caseLocation.findUnique({
        where: { id: targetId },
        select: { id: true, name: true, gameCaseId: true },
      });

      if (!target || target.gameCaseId !== response.thread.suspect.gameCaseId) {
        throw new BadRequestException('Location not found in this case');
      }

      targetName = target.name;
      break;
    }

    case 'SUSPECT': {
      const target = await this.prisma.caseSuspect.findUnique({
        where: { id: targetId },
        select: { id: true, name: true, gameCaseId: true },
      });

      if (!target || target.gameCaseId !== response.thread.suspect.gameCaseId) {
        throw new BadRequestException('Suspect not found in this case');
      }

      if (target.id === response.thread.suspect.id) {
        throw new BadRequestException('A suspect cannot unlock themselves');
      }

      targetName = target.name;
      break;
    }
  }

  const existing = await this.prisma.interviewResponseUnlock.findFirst({
    where: {
      responseId,
      clueId: dto.type === 'CLUE' ? targetId : null,
      documentId: dto.type === 'DOCUMENT' ? targetId : null,
      locationId: dto.type === 'LOCATION' ? targetId : null,
      suspectId: dto.type === 'SUSPECT' ? targetId : null,
    },
    select: { id: true },
  });

  if (existing) {
    throw new BadRequestException('This response already unlocks that item');
  }

  const unlock = await this.prisma.interviewResponseUnlock.create({
    data: {
      responseId,
      clueId: dto.type === 'CLUE' ? targetId : null,
      documentId: dto.type === 'DOCUMENT' ? targetId : null,
      locationId: dto.type === 'LOCATION' ? targetId : null,
      suspectId: dto.type === 'SUSPECT' ? targetId : null,
    },
    select: {
      id: true,
      responseId: true,
      clueId: true,
      documentId: true,
      locationId: true,
      suspectId: true,
      createdAt: true,
    },
  });

  return {
    message: 'Interview discovery configured successfully',
    responseId,
    topic: response.thread.topic,
    targetName,
    unlock,
  };
  

  

}

async createLead(caseId: string, dto: CreateCaseLeadDto) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  if (dto.sourceLocationId === dto.destinationLocationId) {
    throw new BadRequestException(
      'Source and destination locations must be different',
    );
  }

  const [sourceLocation, destinationLocation] = await Promise.all([
    this.prisma.caseLocation.findFirst({
      where: {
        id: dto.sourceLocationId,
        gameCaseId: caseId,
      },
      select: { id: true },
    }),
    this.prisma.caseLocation.findFirst({
      where: {
        id: dto.destinationLocationId,
        gameCaseId: caseId,
      },
      select: { id: true },
    }),
  ]);

  if (!sourceLocation || !destinationLocation) {
    throw new BadRequestException(
      'Both locations must belong to this case',
    );
  }

  if (dto.requiredClueId) {
    const clue = await this.prisma.caseClue.findFirst({
      where: {
        id: dto.requiredClueId,
        location: { gameCaseId: caseId },
      },
      select: { id: true },
    });

    if (!clue) {
      throw new BadRequestException(
        'Required clue must belong to this case',
      );
    }
  }

  return this.prisma.caseLead.create({
    data: {
      sourceLocationId: dto.sourceLocationId,
      destinationLocationId: dto.destinationLocationId,
      requiredClueId: dto.requiredClueId,
      title: dto.title,
      description: dto.description,
    },
  });
}

async getLeads(caseId: string) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  return this.prisma.caseLead.findMany({
    where: {
      sourceLocation: {
        gameCaseId: caseId,
      },
    },
    include: {
      sourceLocation: {
        select: { id: true, name: true },
      },
      destinationLocation: {
        select: { id: true, name: true },
      },
      requiredClue: {
        select: { id: true, title: true },
      },
    },
    orderBy: {
      title: 'asc',
    },
  });
}


async deleteLead(caseId: string, leadId: string) {
  const lead = await this.prisma.caseLead.findFirst({
    where: {
      id: leadId,
      sourceLocation: {
        gameCaseId: caseId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!lead) {
    throw new NotFoundException('Lead not found for this case');
  }

  await this.prisma.caseLead.delete({
    where: {
      id: lead.id,
    },
  });

  return {
    message: 'Lead deleted successfully',
    leadId: lead.id,
  };
}


async createCaseHint(
  caseId: string,
  dto: CreateCaseHintDto,
) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  const existing = await this.prisma.caseHint.findUnique({
    where: {
      gameCaseId_hintNumber: {
        gameCaseId: caseId,
        hintNumber: dto.hintNumber,
      },
    },
  });

  if (existing) {
    throw new ConflictException(
      'A hint with this number already exists for this case',
    );
  }

  return this.prisma.caseHint.create({
    data: {
      gameCaseId: caseId,
      hintNumber: dto.hintNumber,
      content: dto.content,
      scorePenalty: dto.scorePenalty ?? 0,
    },
  });
}

async getCaseHints(caseId: string) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  return this.prisma.caseHint.findMany({
    where: { gameCaseId: caseId },
    orderBy: { hintNumber: 'asc' },
  });
}

async updateCaseHint(
  caseId: string,
  hintId: string,
  dto: UpdateCaseHintDto,
) {
  const hint = await this.prisma.caseHint.findFirst({
    where: {
      id: hintId,
      gameCaseId: caseId,
    },
  });

  if (!hint) {
    throw new NotFoundException('Hint not found in this case');
  }

  if (dto.hintNumber !== undefined) {
    const duplicate = await this.prisma.caseHint.findFirst({
      where: {
        gameCaseId: caseId,
        hintNumber: dto.hintNumber,
        NOT: { id: hintId },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException(
        'A hint with this number already exists for this case',
      );
    }
  }

  return this.prisma.caseHint.update({
    where: { id: hintId },
    data: {
      ...(dto.hintNumber !== undefined && {
        hintNumber: dto.hintNumber,
      }),
      ...(dto.content !== undefined && {
        content: dto.content,
      }),
      ...(dto.scorePenalty !== undefined && {
        scorePenalty: dto.scorePenalty,
      }),
    },
  });
}

async deleteCaseHint(caseId: string, hintId: string) {
  const hint = await this.prisma.caseHint.findFirst({
    where: {
      id: hintId,
      gameCaseId: caseId,
    },
    select: { id: true },
  });

  if (!hint) {
    throw new NotFoundException('Hint not found in this case');
  }

  await this.prisma.caseHint.delete({
    where: { id: hintId },
  });

  return { message: 'Hint deleted successfully' };
}


async getCaseSolution(caseId: string) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  return this.prisma.caseSolution.findUnique({
    where: { gameCaseId: caseId },
  });
}

async upsertCaseSolution(
  caseId: string,
  dto: UpsertCaseSolutionDto,
) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  const suspect = await this.prisma.caseSuspect.findFirst({
    where: {
      id: dto.correctSuspectId,
      gameCaseId: caseId,
    },
    select: { id: true },
  });

  if (!suspect) {
    throw new NotFoundException(
      'Correct suspect must belong to this case',
    );
  }

  return this.prisma.caseSolution.upsert({
    where: { gameCaseId: caseId },
    create: {
      gameCaseId: caseId,
      correctSuspectId: dto.correctSuspectId,
      motive: dto.motive,
      method: dto.method,
      explanation: dto.explanation,
      epilogue: dto.epilogue,
      motiveKeywords: dto.motiveKeywords ?? [],
      methodKeywords: dto.methodKeywords ?? [],
    },
    update: {
      correctSuspectId: dto.correctSuspectId,
      motive: dto.motive,
      method: dto.method,
      explanation: dto.explanation,
      epilogue: dto.epilogue,
      motiveKeywords: dto.motiveKeywords ?? [],
      methodKeywords: dto.methodKeywords ?? [],
    },
  });
}



async createLocation(
  caseId: string,
  dto: CreateLocationDto,
) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  return this.prisma.caseLocation.create({
    data: {
      gameCaseId: caseId,
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      mapX: dto.mapX,
      mapY: dto.mapY,
      isInitiallyOpen: dto.isInitiallyOpen ?? false,
      isDeadEnd: dto.isDeadEnd ?? false,
      searchActionPointCost: dto.searchActionPointCost ?? 1,
      sortOrder: dto.sortOrder ?? 0,
    },
  });
}

async getLocations(caseId: string) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  return this.prisma.caseLocation.findMany({
    where: { gameCaseId: caseId },
    orderBy: { sortOrder: 'asc' },
  });
}

async updateLocation(
  caseId: string,
  locationId: string,
  dto: UpdateLocationDto,
) {
  const location = await this.prisma.caseLocation.findFirst({
    where: {
      id: locationId,
      gameCaseId: caseId,
    },
    select: { id: true },
  });

  if (!location) {
    throw new NotFoundException(
      'Location not found in this case',
    );
  }

  return this.prisma.caseLocation.update({
    where: { id: locationId },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && {
        description: dto.description,
      }),
      ...(dto.imageUrl !== undefined && {
        imageUrl: dto.imageUrl,
      }),
      ...(dto.mapX !== undefined && { mapX: dto.mapX }),
      ...(dto.mapY !== undefined && { mapY: dto.mapY }),
      ...(dto.isInitiallyOpen !== undefined && {
        isInitiallyOpen: dto.isInitiallyOpen,
      }),
      ...(dto.isDeadEnd !== undefined && {
        isDeadEnd: dto.isDeadEnd,
      }),
      ...(dto.searchActionPointCost !== undefined && {
        searchActionPointCost: dto.searchActionPointCost,
      }),
      ...(dto.sortOrder !== undefined && {
        sortOrder: dto.sortOrder,
      }),
    },
  });
}

async deleteLocation(
  caseId: string,
  locationId: string,
) {
  const location = await this.prisma.caseLocation.findFirst({
    where: {
      id: locationId,
      gameCaseId: caseId,
    },
    select: { id: true },
  });

  if (!location) {
    throw new NotFoundException(
      'Location not found in this case',
    );
  }

  await this.prisma.caseLocation.delete({
    where: { id: locationId },
  });

  return { message: 'Location deleted successfully' };
}


async createClue(
  caseId: string,
  locationId: string,
  dto: CreateClueDto,
) {
  const location = await this.prisma.caseLocation.findFirst({
    where: {
      id: locationId,
      gameCaseId: caseId,
    },
    select: { id: true },
  });

  if (!location) {
    throw new NotFoundException(
      'Location not found in this case',
    );
  }

  return this.prisma.caseClue.create({
    data: {
      locationId,
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      tags: dto.tags ?? [],
      isRequired: dto.isRequired ?? false,
      sortOrder: dto.sortOrder ?? 0,
    },
  });
}

async getClues(caseId: string, locationId: string) {
  const location = await this.prisma.caseLocation.findFirst({
    where: {
      id: locationId,
      gameCaseId: caseId,
    },
    select: { id: true },
  });

  if (!location) {
    throw new NotFoundException(
      'Location not found in this case',
    );
  }

  return this.prisma.caseClue.findMany({
    where: { locationId },
    orderBy: { sortOrder: 'asc' },
  });
}

async updateClue(
  caseId: string,
  locationId: string,
  clueId: string,
  dto: UpdateClueDto,
) {
  const clue = await this.prisma.caseClue.findFirst({
    where: {
      id: clueId,
      locationId,
      location: { gameCaseId: caseId },
    },
    select: { id: true },
  });

  if (!clue) {
    throw new NotFoundException(
      'Clue not found at this location in this case',
    );
  }

  return this.prisma.caseClue.update({
    where: { id: clueId },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && {
        description: dto.description,
      }),
      ...(dto.imageUrl !== undefined && {
        imageUrl: dto.imageUrl,
      }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.isRequired !== undefined && {
        isRequired: dto.isRequired,
      }),
      ...(dto.sortOrder !== undefined && {
        sortOrder: dto.sortOrder,
      }),
    },
  });
}

async deleteClue(
  caseId: string,
  locationId: string,
  clueId: string,
) {
  const clue = await this.prisma.caseClue.findFirst({
    where: {
      id: clueId,
      locationId,
      location: { gameCaseId: caseId },
    },
    select: { id: true },
  });

  if (!clue) {
    throw new NotFoundException(
      'Clue not found at this location in this case',
    );
  }

  await this.prisma.caseClue.delete({
    where: { id: clueId },
  });

  return { message: 'Clue deleted successfully' };
}


async createDocument(
  caseId: string,
  locationId: string,
  dto: CreateDocumentDto,
) {
  const location = await this.prisma.caseLocation.findFirst({
    where: { id: locationId, gameCaseId: caseId },
    select: { id: true },
  });

  if (!location) {
    throw new NotFoundException(
      'Location not found in this case',
    );
  }

  return this.prisma.caseDocument.create({
    data: {
      locationId,
      title: dto.title,
      description: dto.description,
      content: dto.content,
      fileUrl: dto.fileUrl,
      sortOrder: dto.sortOrder ?? 0,
    },
  });
}

async getDocuments(caseId: string, locationId: string) {
  const location = await this.prisma.caseLocation.findFirst({
    where: { id: locationId, gameCaseId: caseId },
    select: { id: true },
  });

  if (!location) {
    throw new NotFoundException(
      'Location not found in this case',
    );
  }

  return this.prisma.caseDocument.findMany({
    where: { locationId },
    orderBy: { sortOrder: 'asc' },
  });
}

async updateDocument(
  caseId: string,
  locationId: string,
  documentId: string,
  dto: UpdateDocumentDto,
) {
  const document = await this.prisma.caseDocument.findFirst({
    where: {
      id: documentId,
      locationId,
      location: { gameCaseId: caseId },
    },
    select: { id: true },
  });

  if (!document) {
    throw new NotFoundException(
      'Document not found in this location and case',
    );
  }

  return this.prisma.caseDocument.update({
    where: { id: documentId },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && {
        description: dto.description,
      }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.fileUrl !== undefined && { fileUrl: dto.fileUrl }),
      ...(dto.sortOrder !== undefined && {
        sortOrder: dto.sortOrder,
      }),
    },
  });
}

async deleteDocument(
  caseId: string,
  locationId: string,
  documentId: string,
) {
  const document = await this.prisma.caseDocument.findFirst({
    where: {
      id: documentId,
      locationId,
      location: { gameCaseId: caseId },
    },
    select: { id: true },
  });

  if (!document) {
    throw new NotFoundException(
      'Document not found in this location and case',
    );
  }

  await this.prisma.caseDocument.delete({
    where: { id: documentId },
  });

  return { message: 'Document deleted successfully' };
}



async getCaseVictim(caseId: string) {
  const caseExists = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!caseExists) {
    throw new NotFoundException('Case not found');
  }

  return this.prisma.caseVictim.findUnique({
    where: { gameCaseId: caseId },
  });
}

async upsertCaseVictim(
  caseId: string,
  dto: UpsertCaseVictimDto,
) {
  const caseExists = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!caseExists) {
    throw new NotFoundException('Case not found');
  }

  const data = {
    name: dto.name,
    age: dto.age,
    occupation: dto.occupation,
    dateOfDeath: new Date(dto.dateOfDeath),
    placeOfDeath: dto.placeOfDeath,
    biography: dto.biography,
  };

  return this.prisma.caseVictim.upsert({
    where: { gameCaseId: caseId },
    create: {
      gameCaseId: caseId,
      ...data,
    },
    update: data,
  });
}

async deleteCaseVictim(caseId: string) {
  const victim = await this.prisma.caseVictim.findUnique({
    where: { gameCaseId: caseId },
    select: { id: true },
  });

  if (!victim) {
    throw new NotFoundException('Victim not found for this case');
  }

  await this.prisma.caseVictim.delete({
    where: { gameCaseId: caseId },
  });

  return { message: 'Case victim deleted successfully' };
}

async getPoliceReport(caseId: string) {
  const caseExists = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!caseExists) {
    throw new NotFoundException('Case not found');
  }

  return this.prisma.policeReport.findUnique({
    where: { gameCaseId: caseId },
  });
}

async upsertPoliceReport(
  caseId: string,
  dto: UpsertPoliceReportDto,
) {
  const caseExists = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true },
  });

  if (!caseExists) {
    throw new NotFoundException('Case not found');
  }

  if (
    dto.timeOfDeathStart &&
    dto.timeOfDeathEnd &&
    new Date(dto.timeOfDeathEnd) < new Date(dto.timeOfDeathStart)
  ) {
    throw new BadRequestException(
      'timeOfDeathEnd must be later than or equal to timeOfDeathStart',
    );
  }

  const data = {
    timeOfDeathStart: dto.timeOfDeathStart
      ? new Date(dto.timeOfDeathStart)
      : null,
    timeOfDeathEnd: dto.timeOfDeathEnd
      ? new Date(dto.timeOfDeathEnd)
      : null,
    causeOfDeath: dto.causeOfDeath,
    officerNotes: dto.officerNotes,
    ...(dto.isPublished !== undefined && {
      isPublished: dto.isPublished,
    }),
  };

  return this.prisma.policeReport.upsert({
    where: { gameCaseId: caseId },
    create: {
      gameCaseId: caseId,
      ...data,
    },
    update: data,
  });
}

async deletePoliceReport(caseId: string) {
  const report = await this.prisma.policeReport.findUnique({
    where: { gameCaseId: caseId },
    select: { id: true },
  });

  if (!report) {
    throw new NotFoundException(
      'Police report not found for this case',
    );
  }

  await this.prisma.policeReport.delete({
    where: { gameCaseId: caseId },
  });

  return { message: 'Police report deleted successfully' };
}

async updateInterviewThread(
  threadId: string,
  dto: UpdateInterviewThreadDto,
) {
  const thread = await this.prisma.interviewThread.findUnique({
    where: { id: threadId },
  });

  if (!thread) {
    throw new NotFoundException('Interview thread not found');
  }

  return this.prisma.interviewThread.update({
    where: { id: threadId },
    data: dto,
  });
}

async deleteInterviewThread(threadId: string) {
  const thread = await this.prisma.interviewThread.findUnique({
    where: { id: threadId },
    include: {
      answers: { take: 1 },
      responses: { take: 1 },
    },
  });

  if (!thread) {
    throw new NotFoundException('Interview thread not found');
  }

  if (thread.answers.length > 0 || thread.responses.length > 0) {
    throw new ConflictException(
      'Delete or resolve dependent interview data before deleting this thread',
    );
  }

  await this.prisma.interviewThread.delete({
    where: { id: threadId },
  });

  return { message: 'Interview thread deleted successfully' };
}

async updateInterviewResponse(
  responseId: string,
  dto: UpdateInterviewResponseDto,
) {
  const response = await this.prisma.interviewResponse.findUnique({
    where: { id: responseId },
  });

  if (!response) {
    throw new NotFoundException('Interview response not found');
  }

  return this.prisma.interviewResponse.update({
    where: { id: responseId },
    data: dto,
  });
}

async deleteInterviewResponse(responseId: string) {
  const response = await this.prisma.interviewResponse.findUnique({
    where: { id: responseId },
    include: {
      answers: { take: 1 },
      discoveries: { take: 1 },
      unlocks: { take: 1 },
    },
  });

  if (!response) {
    throw new NotFoundException('Interview response not found');
  }

  if (
    response.answers.length > 0 ||
    response.discoveries.length > 0 ||
    response.unlocks.length > 0
  ) {
    throw new ConflictException(
      'This response is referenced by gameplay data and cannot be deleted safely',
    );
  }

  await this.prisma.interviewResponse.delete({
    where: { id: responseId },
  });

  return { message: 'Interview response deleted successfully' };
}



async getInterviewResponseUnlocks(responseId: string) {
  const response = await this.prisma.interviewResponse.findUnique({
    where: { id: responseId },
    include: {
      thread: {
        include: {
          suspect: {
            select: { gameCaseId: true },
          },
        },
      },
      unlocks: {
        include: {
          clue: true,
          document: true,
          location: true,
          suspect: true,
        },
      },
    },
  });

  if (!response) {
    throw new NotFoundException('Interview response not found');
  }

  return response.unlocks;
}

async updateInterviewResponseUnlock(
  unlockId: string,
  dto: UpdateInterviewResponseUnlockDto,
) {
  const unlock = await this.prisma.interviewResponseUnlock.findUnique({
    where: { id: unlockId },
    include: {
      response: {
        include: {
          thread: {
            include: {
              suspect: {
                select: { gameCaseId: true },
              },
            },
          },
        },
      },
    },
  });

  if (!unlock) {
    throw new NotFoundException('Interview response unlock not found');
  }

  const fields = ['clueId', 'documentId', 'locationId', 'suspectId'] as const;
  const targetFields = fields.filter((field) =>
    Object.prototype.hasOwnProperty.call(dto, field),
  );

  if (targetFields.length !== 1) {
    throw new BadRequestException(
      'Provide exactly one target field: clueId, documentId, locationId, or suspectId',
    );
  }

  const targetField = targetFields[0];
  const targetId = dto[targetField];

  if (!targetId) {
    throw new BadRequestException(
      'A target ID is required. Create a different unlock rule to change the target type.',
    );
  }

  const gameCaseId =
    unlock.response.thread.suspect.gameCaseId;

  let targetExists = false;

  switch (targetField) {
    case 'clueId': {
      const target = await this.prisma.caseClue.findUnique({
        where: { id: targetId },
        select: { location: { select: { gameCaseId: true } } },
      });
      targetExists = target?.location.gameCaseId === gameCaseId;
      break;
    }

    case 'documentId': {
      const target = await this.prisma.caseDocument.findUnique({
        where: { id: targetId },
        select: { location: { select: { gameCaseId: true } } },
      });
      targetExists = target?.location.gameCaseId === gameCaseId;
      break;
    }

    case 'locationId': {
      const target = await this.prisma.caseLocation.findFirst({
        where: { id: targetId, gameCaseId },
        select: { id: true },
      });
      targetExists = !!target;
      break;
    }

    case 'suspectId': {
      const target = await this.prisma.caseSuspect.findFirst({
        where: { id: targetId, gameCaseId },
        select: { id: true },
      });
      targetExists = !!target;
      break;
    }
  }

  if (!targetExists) {
    throw new BadRequestException(
      'The target does not exist or does not belong to this case',
    );
  }

  return this.prisma.interviewResponseUnlock.update({
    where: { id: unlockId },
    data: {
      clueId: targetField === 'clueId' ? targetId : null,
      documentId: targetField === 'documentId' ? targetId : null,
      locationId: targetField === 'locationId' ? targetId : null,
      suspectId: targetField === 'suspectId' ? targetId : null,
    },
  });
}

async deleteInterviewResponseUnlock(unlockId: string) {
  const unlock = await this.prisma.interviewResponseUnlock.findUnique({
    where: { id: unlockId },
    select: { id: true },
  });

  if (!unlock) {
    throw new NotFoundException('Interview response unlock not found');
  }

  await this.prisma.interviewResponseUnlock.delete({
    where: { id: unlockId },
  });

  return { message: 'Interview response unlock deleted successfully' };
}



}
