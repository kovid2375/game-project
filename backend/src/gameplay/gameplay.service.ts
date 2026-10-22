import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PlayerCaseStatus } from '../generated/prisma/enums.js';
import { title } from 'process';
import { take, throwError } from 'rxjs';
import { Prisma } from '../generated/prisma/client.js';
import { CreateNotebookEntryDto } from './dto/create-notebook-entry.dto.js';
import { UpdateNotebookEntryDto } from './dto/update-notebook-entry.dto.js';
import { UpdateTheoryDraftDto } from './dto/update-theory-draft.dto.js';
import { SubmitAccusationDto } from './dto/submit-accusation.dto.js';

@Injectable()
export class GameplayService {
  constructor(private readonly prisma: PrismaService,private readonly MAX_ACCUSATION_ATTEMPTS = 3) {}
  async startOrResumeCase(caseId: string, userId: string) {
    const gameCase = await this.prisma.gameCase.findFirst({
      where: {
        id: caseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        caseNumber: true,
      },
    });
    if (!gameCase) {
      throw new NotFoundException('Publish case not found or not active');
    }
    // Resuse the players existing investigation if one exists
    const existing = await this.prisma.playerCase.findUnique({
      where: {
        userId_gameCaseId: {
          userId,
          gameCaseId: caseId,
        },
      },
    });
    if (existing) {
      if (existing.status === PlayerCaseStatus.ABANDONED) {
        throw new ConflictException(
          'This investigation was abandoned and cannot be resumed. Please start a new case.',
        );
      }
      return {
        message:
          existing?.status === PlayerCaseStatus.COMPLETED
            ? 'Case already completed'
            : 'Investigattion Resumed',
        case: gameCase,
        progress: existing,
        isNew: false,
      };
    }
    //Use the configured starting Ap Later ; 10 is the current startingAp for all cases

    const progress = await this.prisma.playerCase.create({
      data: {
        userId,
        gameCaseId: caseId,
        actionPoints: 10,
        currentPhase: 1,
        status: PlayerCaseStatus.IN_PROGRESS,
      },
    });
    return {
      message: 'Investigation started',
      case: gameCase,
      progress,
      isNew: true,
    };
  }

  async getCaseFile(userId: string, playerCaseId: string) {
    const progress = await this.prisma.playerCase.findFirst({
      where: {
        id: playerCaseId,
        userId,
      },
      include: {
        gameCase: {
          include: {
            victim: true,
            policeReport: true,
            statements: {
              where: { isInitial: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
    if (!progress) {
      throw new NotFoundException('Investigation not found');
    }
    if (progress.status !== PlayerCaseStatus.IN_PROGRESS) {
      throw new ConflictException('This investigation is not active');
    }
    //Record that the case file has been opened.

    if (!progress.caseFileOpenedAt) {
      await this.prisma.playerCase.update({
        where: { id: progress.id },
        data: {
          caseFileOpenedAt: new Date(),
          lastActivityAt: new Date(),
        },
      });
    }
    return {
      progress: {
        id: progress.id,
        status: progress.status,
        currentPhase: progress.currentPhase,
        casefileOpenedAt: progress.caseFileOpenedAt ?? new Date(),
      },
      case: {
        id: progress.gameCaseId,
        caseNumber: progress.gameCase.caseNumber,
        title: progress.gameCase.title,
        description: progress.gameCase.description,
        victim: progress.gameCase.victim,
        policeReport: progress.gameCase.policeReport,
        initialStatements: progress.gameCase.statements,
      },
    };
  }

  async readyForSuspects(userId: string, playerCaseId: string) {
    const progress = await this.prisma.playerCase.findFirst({
      where: {
        id: playerCaseId,
        userId,
      },
      include: {
        gameCase: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    if (!progress) {
      throw new NotFoundException('Investigation not found by this player');
    }
    if (progress.status !== PlayerCaseStatus.IN_PROGRESS) {
      throw new ConflictException('This investigation is not active ');
    }
    if (!progress.caseFileOpenedAt) {
      throw new ConflictException(
        'Open the case file before meeting the suspects',
      );
    }
    if (progress.currentPhase >= 2) {
      return {
        message: 'Suspects phase already unlocked',
        currentPhase: progress.currentPhase,
      };
    }
    const update = await this.prisma.playerCase.update({
      where: {
        id: playerCaseId,
      },
      data: {
        currentPhase: 2,
        lastActivityAt: new Date(),
      },
    });
    return {
      message: 'Suspects phase unlocked',
      case: progress.gameCase,
      currentPhase: update.currentPhase,
    };
  }

  async getSuspects(userId: string, playerCaseId: string) {
    const progress = await this.prisma.playerCase.findFirst({
      where: {
        id: playerCaseId,
        userId,
      },
      select: {
        id: true,
        status: true,
        currentPhase: true,
        gameCaseId: true,
      },
    });
    if (!progress) {
      throw new NotFoundException('Investigation not found');
    }
    if (progress.status !== PlayerCaseStatus.IN_PROGRESS) {
      throw new ConflictException('Investigation is not in progress');
    }
    if (progress.currentPhase < 2) {
      throw new ForbiddenException(
        'Open the case file unlock the suspects phase first',
      );
    }
    
const suspects = await this.prisma.caseSuspect.findMany({
  where: {
    gameCaseId: progress.gameCaseId,
  },
  orderBy: [
    { sortOrder: 'asc' },
    { name: 'asc' },
  ],
  select: {
    id: true,
    name: true,
    photoUrl: true,
    relationship: true,
    description: true,
    sortOrder: true,
    isInitiallyUnlocked: true,
    playerUnlocks: {
      where: { playerCaseId },
      select: { id: true },
    },
  },
});

    return {
      playerCaseId,
      totalSuspects: suspects.length,
      suspects: suspects.map((suspect) => {
        const isUnlocked =
          suspect.isInitiallyUnlocked || suspect.playerUnlocks.length > 0;

        if (!isUnlocked) {
          return {
            id: suspect.id,
            isUnlocked: false,
            sortOrder: suspect.sortOrder,
            name: null,
            photoUrl: null,
            relationship: null,
            description: null,
          };
        }

        return {
          id: suspect.id,
          isUnlocked: true,
          name: suspect.name,
          photoUrl: suspect.photoUrl,
          relationship: suspect.relationship,
          description: suspect.description,
          sortOrder: suspect.sortOrder,
        };
      }),
    };
  }

  

async getLocations(userId: string, playerCaseId: string) {
  const progress = await this.prisma.playerCase.findFirst({
    where: {
      id: playerCaseId,
      userId,
    },
    select: {
      id: true,
      gameCaseId: true,
      status: true,
      currentPhase: true,
    },
  });

  if (!progress) {
    throw new NotFoundException('Investigation not found');
  }

  if (
    progress.status !== PlayerCaseStatus.IN_PROGRESS ||
    progress.currentPhase < 2
  ) {
    throw new ForbiddenException(
      'Locations are not available at this stage of the investigation',
    );
  }

  const locations = await this.prisma.caseLocation.findMany({
    where: {
      gameCaseId: progress.gameCaseId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      mapX: true,
      mapY: true,
      isInitiallyOpen: true,
      isDeadEnd: true,
      sortOrder: true,
      playerUnlocks: {
        where: { playerCaseId },
        select: {
          id: true,
          reason: true,
          unlockedAt: true,
        },
      },
      visits: {
        where: { playerCaseId },
        select: {
          searchedAt: true,
          visitCount: true,
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return locations.map((location) => {
    const isUnlocked =
      location.isInitiallyOpen || location.playerUnlocks.length > 0;

    const visit = location.visits[0];
    const isInvestigated = Boolean(visit?.searchedAt);

    return {
      id: location.id,
      name: isUnlocked ? location.name : null,
      description: isUnlocked ? location.description : null,
      imageUrl: isUnlocked ? location.imageUrl : null,
      mapX: location.mapX,
      mapY: location.mapY,
      isUnlocked,
      isInvestigated: isUnlocked && isInvestigated,
      isDeadEnd: isUnlocked ? location.isDeadEnd : null,
      sortOrder: location.sortOrder,
      unlockReason: location.playerUnlocks[0]?.reason ?? null,
      unlockedAt: location.playerUnlocks[0]?.unlockedAt ?? null,
    };
  });
}


async getLocationDetails(
  userId: string,
  playerCaseId: string,
  locationId: string,
) {
  const progress = await this.prisma.playerCase.findFirst({
    where: {
      id: playerCaseId,
      userId,
    },
    select: {
      id: true,
      gameCaseId: true,
      status: true,
      currentPhase: true,
    },
  });

  if (!progress) {
    throw new NotFoundException('Investigation not found');
  }

  if (
    progress.status !== PlayerCaseStatus.IN_PROGRESS ||
    progress.currentPhase < 2
  ) {
    throw new ForbiddenException(
      'Location exploration is not available at this stage',
    );
  }

  const location = await this.prisma.caseLocation.findFirst({
    where: {
      id: locationId,
      gameCaseId: progress.gameCaseId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      mapX: true,
      mapY: true,
      isInitiallyOpen: true,
      sortOrder: true,
      playerUnlocks: {
        where: {
          playerCaseId,
        },
        select: {
          id: true,
          reason: true,
          unlockedAt: true,
        },
      },
    },
  });

  if (!location) {
    throw new NotFoundException('Location not found');
  }

  const isUnlocked =
    location.isInitiallyOpen || location.playerUnlocks.length > 0;

  if (!isUnlocked) {
    throw new ForbiddenException('This location is locked');
  }

  return {
    id: location.id,
    name: location.name,
    description: location.description,
    imageUrl: location.imageUrl,
    mapX: location.mapX,
    mapY: location.mapY,
    sortOrder: location.sortOrder,
    unlockReason: location.playerUnlocks[0]?.reason ?? null,
    unlockedAt: location.playerUnlocks[0]?.unlockedAt ?? null,
  };
}



async investigateLocation(
  userId: string,
  playerCaseId: string,
  locationId: string,
) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const progress = await tx.playerCase.findFirst({
            where: {
              id: playerCaseId,
              userId,
            },
            select: {
              id: true,
              gameCaseId: true,
              status: true,
              currentPhase: true,
              actionPoints: true,
            },
          });

          if (!progress) {
            throw new NotFoundException('Investigation not found');
          }

          if (
            progress.status !== PlayerCaseStatus.IN_PROGRESS ||
            progress.currentPhase < 2
          ) {
            throw new ForbiddenException(
              'Investigation is not available for exploration',
            );
          }

          const location = await tx.caseLocation.findFirst({
            where: {
              id: locationId,
              gameCaseId: progress.gameCaseId,
            },
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
              isInitiallyOpen: true,
              searchActionPointCost: true,
              clues: {
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  imageUrl: true,
                  tags: true,
                  isRequired: true,
                },
              },
              documents: {
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  content: true,
                  fileUrl: true,
                },
              },
              playerUnlocks: {
                where: { playerCaseId },
                select: { id: true },
              },
            },
          });

          if (!location) {
            throw new NotFoundException('Location not found');
          }

          const isUnlocked =
            location.isInitiallyOpen ||
            location.playerUnlocks.length > 0;

          if (!isUnlocked) {
            throw new ForbiddenException('This location is locked');
          }

          const existingVisit = await tx.playerLocationVisit.findUnique({
            where: {
              playerCaseId_locationId: {
                playerCaseId,
                locationId,
              },
            },
          });

          // Repeated searches do not spend action points again.
          if (existingVisit?.searchedAt) {
            const discoveries = await tx.playerDiscovery.findMany({
              where: {
                playerCaseId,
                OR: [
                  {
                    clueId: {
                      in: location.clues.map((clue) => clue.id),
                    },
                  },
                  {
                    documentId: {
                      in: location.documents.map(
                        (document) => document.id,
                      ),
                    },
                  },
                ],
              },
              select: {
                clueId: true,
                documentId: true,
              },
            });

            const currentProgress = await tx.playerCase.findUnique({
              where: { id: playerCaseId },
              select: { actionPoints: true },
            });

            return {
              location: {
                id: location.id,
                name: location.name,
                description: location.description,
                imageUrl: location.imageUrl,
              },
              repeatedSearch: true,
              actionPointsSpent: 0,
              remainingActionPoints:
                currentProgress?.actionPoints ?? 0,
              clues: location.clues.filter((clue) =>
                discoveries.some(
                  (item) => item.clueId === clue.id,
                ),
              ),
              documents: location.documents.filter((document) =>
                discoveries.some(
                  (item) => item.documentId === document.id,
                ),
              ),
              unlockedLocations: [],
              message: 'Location was already investigated',
            };
          }

          const cost = location.searchActionPointCost;

          if (cost < 0) {
            throw new BadRequestException(
              'Invalid location search cost',
            );
          }

          if (progress.actionPoints < cost) {
            throw new BadRequestException(
              'Insufficient action points',
            );
          }

          // Deduct action points only if the investigation remains active
          // and the player has enough points.
          const spend = await tx.playerCase.updateMany({
            where: {
              id: playerCaseId,
              userId,
              status: PlayerCaseStatus.IN_PROGRESS,
              currentPhase: { gte: 2 },
              actionPoints: { gte: cost },
            },
            data: {
              actionPoints: { decrement: cost },
              lastActivityAt: new Date(),
            },
          });

          if (spend.count !== 1) {
            throw new BadRequestException(
              'Insufficient action points or investigation unavailable',
            );
          }

          await tx.playerLocationVisit.upsert({
            where: {
              playerCaseId_locationId: {
                playerCaseId,
                locationId,
              },
            },
            create: {
              playerCaseId,
              locationId,
              searchedAt: new Date(),
              visitCount: 1,
            },
            update: {
              searchedAt: new Date(),
              visitCount: { increment: 1 },
            },
          });

          // Discover clues without creating duplicate records.
          const newClues: typeof location.clues = [];

          for (const clue of location.clues) {
            const existing = await tx.playerDiscovery.findFirst({
              where: {
                playerCaseId,
                clueId: clue.id,
                type: 'CLUE',
              },
              select: { id: true },
            });

            if (!existing) {
              const created = await tx.playerDiscovery.createMany({
                data: [
                  {
                    playerCaseId,
                    type: 'CLUE',
                    clueId: clue.id,
                  },
                ],
                skipDuplicates: true,
              });

              if (created.count > 0) {
                newClues.push(clue);
              }
            }
          }

          // Discover documents without creating duplicate records.
          const newDocuments: typeof location.documents = [];

          for (const document of location.documents) {
            const existing = await tx.playerDiscovery.findFirst({
              where: {
                playerCaseId,
                documentId: document.id,
                type: 'DOCUMENT',
              },
              select: { id: true },
            });

            if (!existing) {
              const created = await tx.playerDiscovery.createMany({
                data: [
                  {
                    playerCaseId,
                    type: 'DOCUMENT',
                    documentId: document.id,
                  },
                ],
                skipDuplicates: true,
              });

              if (created.count > 0) {
                newDocuments.push(document);
              }
            }
          }

          // Reevaluate leads from every location the player has searched.
          const searchedLocations =
            await tx.playerLocationVisit.findMany({
              where: {
                playerCaseId,
                searchedAt: { not: null },
              },
              select: {
                locationId: true,
              },
            });

          const searchedLocationIds = searchedLocations.map(
            (visit) => visit.locationId,
          );

          const leads = await tx.caseLead.findMany({
            where: {
              sourceLocationId: {
                in: searchedLocationIds,
              },
            },
            select: {
              title: true,
              description: true,
              requiredClueId: true,
              destinationLocationId: true,
              destinationLocation: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          const newlyUnlockedLocations: {
            id: string;
            name: string;
            title: string;
            description: string;
          }[] = [];

          for (const lead of leads) {
            if (lead.requiredClueId) {
              const requiredClue =
                await tx.playerDiscovery.findFirst({
                  where: {
                    playerCaseId,
                    clueId: lead.requiredClueId,
                    type: 'CLUE',
                  },
                  select: { id: true },
                });

              if (!requiredClue) {
                continue;
              }
            }

            const existingUnlock =
              await tx.playerLocationUnlock.findUnique({
                where: {
                  playerCaseId_locationId: {
                    playerCaseId,
                    locationId: lead.destinationLocationId,
                  },
                },
                select: { id: true },
              });

            if (existingUnlock) {
              continue;
            }

            await tx.playerLocationUnlock.create({
              data: {
                playerCaseId,
                locationId: lead.destinationLocationId,
                reason: `Lead discovered: ${lead.title}`,
              },
            });

            newlyUnlockedLocations.push({
              id: lead.destinationLocation.id,
              name: lead.destinationLocation.name,
              title: lead.title,
              description: lead.description,
            });
          }

          const updatedProgress = await tx.playerCase.findUnique({
            where: { id: playerCaseId },
            select: { actionPoints: true },
          });

          return {
            location: {
              id: location.id,
              name: location.name,
              description: location.description,
              imageUrl: location.imageUrl,
            },
            repeatedSearch: false,
            actionPointsSpent: cost,
            remainingActionPoints:
              updatedProgress?.actionPoints ?? 0,
            clues: newClues,
            documents: newDocuments,
            unlockedLocations: newlyUnlockedLocations,
            message:
              newClues.length || newDocuments.length
                ? 'New evidence discovered'
                : 'No new evidence found',
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034' &&
        attempt < 3
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new ConflictException(
    'Investigation conflicted with another request. Please try again.',
  );
}





  async getSuspectDossier(
    userId: string,
    playerCaseId: string,
    suspectId: string,
  ) {
    const progress = await this.prisma.playerCase.findFirst({
      where: {
        id: playerCaseId,
        userId,
      },
      select: {
        id: true,
        status: true,
        currentPhase: true,
        gameCaseId: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Investigation not found');
    }

    if (progress.status !== PlayerCaseStatus.IN_PROGRESS) {
      throw new ConflictException('This investigation is not active');
    }

    if (progress.currentPhase < 2) {
      throw new ForbiddenException('The suspects phase has not been unlocked');
    }

    const suspect = await this.prisma.caseSuspect.findFirst({
      where: {
        id: suspectId,
        gameCaseId: progress.gameCaseId,
      },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        relationship: true,
        description: true,
        claimedAlibi: true,
        connections: true,
        isInitiallyUnlocked: true,
        playerUnlocks: {
          where: {
            playerCaseId,
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!suspect) {
      throw new NotFoundException('Suspect not found');
    }

    const isUnlocked =
      suspect.isInitiallyUnlocked || suspect.playerUnlocks.length > 0;

    if (!isUnlocked) {
      throw new ForbiddenException('This suspect has not been unlocked yet');
    }

    return {
      id: suspect.id,
      name: suspect.name,
      photoUrl: suspect.photoUrl,
      relationship: suspect.relationship,
      description: suspect.description,
      claimedAlibi: suspect.claimedAlibi,
      connections: suspect.connections,
    };
  }

  async getInterviewQuestions(
    userId: string,
    playerCaseId: string,
    suspectId: string,
  ) {
    const progress = await this.prisma.playerCase.findFirst({
      where: {
        id: playerCaseId,
        userId,
      },
      select: {
        id: true,
        gameCaseId: true,
        status: true,
        currentPhase: true,
      },
    });
    if (!progress) {
      throw new NotFoundException('Investigation not found');
    }
    if (progress.status !== 'IN_PROGRESS' || progress.currentPhase < 2) {
      throw new ForbiddenException(
        'You must unlock suspects before interviewing them',
      );
    }
    const suspect = await this.prisma.caseSuspect.findFirst({
      where: {
        id: suspectId,
        gameCaseId: progress.gameCaseId,
      },
      select: {
        id: true,
        name: true,
        isInitiallyUnlocked: true,
        playerUnlocks: {
          where: { playerCaseId },
          select: { id: true },
        },
      },
    });
    if (!suspect) {
      throw new NotFoundException('Suspect not found in this case ');
    }
    if (!suspect.isInitiallyUnlocked && suspect.playerUnlocks.length === 0) {
      throw new ForbiddenException('this suspect is still locked');
    }

    const threads = await this.prisma.interviewThread.findMany({
      where: {
        suspectId,
        isInitiallyAvailable: true,
        visitNumber: 1,
      },
      orderBy: [{ sortOrder: 'asc' }, { topic: 'asc' }],
      select: {
        id: true,
        topic: true,
        question: true,
        visitNumber: true,
        sortOrder: true,
      },
    });
    return {
      suspect: {
        id: suspect.id,
        name: suspect.name,
      },
      totalQuestions: threads.length,
      questions: threads,
    };
  }

  
async answerInterviewQuestion(
  userId: string,
  playerCaseId: string,
  suspectId: string,
  threadId: string,
) {
  const progress = await this.prisma.playerCase.findFirst({
    where: { id: playerCaseId, userId },
    select: {
      id: true,
      gameCaseId: true,
      status: true,
      currentPhase: true,
    },
  });

  if (!progress) {
    throw new NotFoundException('Investigation not found');
  }

  if (progress.status !== 'IN_PROGRESS' || progress.currentPhase < 2) {
    throw new ForbiddenException('Interviewing is not available');
  }

  const suspect = await this.prisma.caseSuspect.findFirst({
    where: { id: suspectId, gameCaseId: progress.gameCaseId },
    select: {
      id: true,
      name: true,
      isInitiallyUnlocked: true,
      playerUnlocks: {
        where: { playerCaseId },
        select: { id: true },
      },
    },
  });

  if (!suspect) {
    throw new NotFoundException('Suspect not found in this case');
  }

  if (!suspect.isInitiallyUnlocked && suspect.playerUnlocks.length === 0) {
    throw new ForbiddenException('This suspect is still locked');
  }

  const visit = await this.prisma.interviewVisit.findFirst({
    where: {
      playerCaseId,
      suspectId,
      endedAt: null,
    },
    orderBy: { visitNumber: 'desc' },
  });

  if (!visit) {
    throw new BadRequestException(
      'Start or resume an interview visit before answering questions',
    );
  }

  if (visit.questionsUsed >= 5) {
    throw new BadRequestException(
      'You have reached the five-question limit for this visit',
    );
  }

  const thread = await this.prisma.interviewThread.findFirst({
    where: {
      id: threadId,
      suspectId,
      visitNumber: { lte: visit.visitNumber },
      OR: [
        { isInitiallyAvailable: true },
        { visitNumber: { lte: visit.visitNumber } },
      ],
    },
    select: {
      id: true,
      topic: true,
      question: true,
      responses: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          id: true,
          responseText: true,
          isNervous: true,
          unlocks: {
            select: {
              id: true,
              clueId: true,
              documentId: true,
              locationId: true,
              suspectId: true,
            },
          },
        },
      },
    },
  });

  if (!thread) {
    throw new BadRequestException(
      'This question is not available for this interview visit',
    );
  }

  const response = thread.responses[0];

  if (!response) {
    throw new BadRequestException(
      'No response has been configured for this question',
    );
  }

  const alreadyAnswered = await this.prisma.interviewAnswer.findFirst({
    where: {
      interviewVisitId: visit.id,
      threadId: thread.id,
    },
    select: { id: true },
  });

  if (alreadyAnswered) {
    throw new BadRequestException(
      'You have already asked this question during this visit',
    );
  }

  await this.prisma.$transaction(async (tx) => {
    await tx.interviewAnswer.create({
      data: {
        interviewVisitId: visit.id,
        threadId: thread.id,
        responseId: response.id,
      },
    });

    await tx.interviewVisit.update({
      where: { id: visit.id },
      data: { questionsUsed: { increment: 1 } },
    });

    for (const unlock of response.unlocks) {
      // Record a clue discovery only once per investigation.
      if (unlock.clueId) {
        const existing = await tx.playerDiscovery.findFirst({
          where: {
            playerCaseId,
            clueId: unlock.clueId,
            type: 'CLUE',
          },
          select: {
            id: true,
          },
        });

        if (!existing) {
          await tx.playerDiscovery.createMany({
            data: [
              {
                playerCaseId,
                type: 'CLUE',
                clueId: unlock.clueId,
              },
            ],
            skipDuplicates: true,
          });
        }
      }

      if (unlock.documentId) {
        const existing = await tx.playerDiscovery.findFirst({
          where: {
            playerCaseId,
            documentId: unlock.documentId,
            type: 'DOCUMENT',
          },
          select: {
            id: true,
          },
        });

        if (!existing) {
          await tx.playerDiscovery.createMany({
            data: [
              {
                playerCaseId,
                type: 'DOCUMENT',
                documentId: unlock.documentId,
              },
            ],
            skipDuplicates: true,
          });
        }
      }

      // Unlock a location for this player only.
      if (unlock.locationId) {
        await tx.playerLocationUnlock.upsert({
          where: {
            playerCaseId_locationId: {
              playerCaseId,
              locationId: unlock.locationId,
            },
          },
          create: {
            playerCaseId,
            locationId: unlock.locationId,
            reason: 'Unlocked through an interview',
          },
          update: {},
        });
      }

      // Unlock another suspect for this player only.
      if (unlock.suspectId) {
        await tx.playerSuspectUnlock.upsert({
          where: {
            playerCaseId_suspectId: {
              playerCaseId,
              suspectId: unlock.suspectId,
            },
          },
          create: {
            playerCaseId,
            suspectId: unlock.suspectId,
            reason: 'Unlocked through an interview',
          },
          update: {},
        });
      }
    }
  });

  return {
    suspect: { id: suspect.id, name: suspect.name },
    question: {
      id: thread.id,
      topic: thread.topic,
      text: thread.question,
    },
    answer: {
      text: response.responseText,
      isNervous: response.isNervous,
    },
    questionsUsed: visit.questionsUsed + 1,
    questionsRemaining: Math.max(0, 5 - (visit.questionsUsed + 1)),
    discoveriesConfigured: response.unlocks.length,
    message: 'Interview answer recorded successfully',
  };
}


  async startInterviewVisit(
    userId: string,
    playerCaseId: string,
    suspectId: string,
  ) {
    const progress = await this.prisma.playerCase.findFirst({
      where: {
        id: playerCaseId,
        userId,
      },
      select: {
        id: true,
        gameCaseId: true,
        status: true,
        currentPhase: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Investigation not found');
    }

    if (progress.status !== 'IN_PROGRESS' || progress.currentPhase < 2) {
      throw new ForbiddenException('Interviewing is not available');
    }

    const suspect = await this.prisma.caseSuspect.findFirst({
      where: {
        id: suspectId,
        gameCaseId: progress.gameCaseId,
      },
      select: {
        id: true,
        name: true,
        isInitiallyUnlocked: true,
        playerUnlocks: {
          where: { playerCaseId },
          select: { id: true },
        },
      },
    });

    if (!suspect) {
      throw new NotFoundException('Suspect not found in this case');
    }

    if (!suspect.isInitiallyUnlocked && suspect.playerUnlocks.length === 0) {
      throw new ForbiddenException('This suspect is still locked');
    }

    const activeVisit = await this.prisma.interviewVisit.findFirst({
      where: {
        playerCaseId,
        suspectId,
        endedAt: null,
      },
      orderBy: { visitNumber: 'desc' },
    });

    if (activeVisit) {
      if (activeVisit.questionsUsed < 5) {
        return {
          message: 'Resumed existing interview visit',
          suspect: { id: suspect.id, name: suspect.name },
          visit: activeVisit,
          questionsRemaining: 5 - activeVisit.questionsUsed,
        };
      }

      await this.prisma.interviewVisit.update({
        where: { id: activeVisit.id },
        data: { endedAt: new Date() },
      });
    }

    const lastVisit = await this.prisma.interviewVisit.findFirst({
      where: { playerCaseId, suspectId },
      orderBy: { visitNumber: 'desc' },
      select: { visitNumber: true },
    });

    const nextVisitNumber = (lastVisit?.visitNumber ?? 0) + 1;

    const visit = await this.prisma.interviewVisit.create({
      data: {
        playerCaseId,
        suspectId,
        visitNumber: nextVisitNumber,
      },
    });

    return {
      message: 'Interview visit started successfully',
      suspect: { id: suspect.id, name: suspect.name },
      visit,
      questionsRemaining: 5,
    };
  }


  
async createNotebookEntry(
  userId: string,
  playerCaseId: string,
  dto: CreateNotebookEntryDto,
) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: {
      id: playerCaseId,
      userId,
    },
    select: { id: true },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  return this.prisma.notebookEntry.create({
    data: {
      playerCaseId,
      title: dto.title,
      content: dto.content,
      tags: dto.tags ?? [],
    },
  });
}

async getNotebookEntries(userId: string, playerCaseId: string) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: {
      id: playerCaseId,
      userId,
    },
    select: { id: true },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  return this.prisma.notebookEntry.findMany({
    where: { playerCaseId },
    orderBy: { updatedAt: 'desc' },
  });
}

async getNotebookEntry(
  userId: string,
  playerCaseId: string,
  entryId: string,
) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: {
      id: playerCaseId,
      userId,
    },
    select: { id: true },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  const entry = await this.prisma.notebookEntry.findFirst({
    where: {
      id: entryId,
      playerCaseId,
    },
  });

  if (!entry) {
    throw new NotFoundException('Notebook entry not found');
  }

  return entry;
}

async updateNotebookEntry(
  userId: string,
  playerCaseId: string,
  entryId: string,
  dto: UpdateNotebookEntryDto,
) {
  await this.getNotebookEntry(userId, playerCaseId, entryId);

  return this.prisma.notebookEntry.update({
    where: { id: entryId },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
    },
  });
}

async deleteNotebookEntry(
  userId: string,
  playerCaseId: string,
  entryId: string,
) {
  await this.getNotebookEntry(userId, playerCaseId, entryId);

  await this.prisma.notebookEntry.delete({
    where: { id: entryId },
  });

  return { message: 'Notebook entry deleted successfully' };
}


async getTheoryDraft(userId: string, playerCaseId: string) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: { id: playerCaseId, userId },
    select: { id: true, gameCaseId: true },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  const draft = await this.prisma.theoryDraft.findUnique({
    where: { playerCaseId },
    include: {
      evidence: {
        include: {
          clue: true,
        },
      },
    },
  });

  if (draft) {
    return draft;
  }

  return this.prisma.theoryDraft.create({
    data: { playerCaseId },
    include: {
      evidence: {
        include: {
          clue: true,
        },
      },
    },
  });
}

async updateTheoryDraft(
  userId: string,
  playerCaseId: string,
  dto: UpdateTheoryDraftDto,
) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: { id: playerCaseId, userId },
    select: { id: true, gameCaseId: true },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  if (dto.suspectId) {
    const suspect = await this.prisma.caseSuspect.findFirst({
      where: {
        id: dto.suspectId,
        gameCaseId: playerCase.gameCaseId,
      },
      select: { id: true },
    });

    if (!suspect) {
      throw new NotFoundException('Suspect not found in this case');
    }
  }

  return this.prisma.theoryDraft.upsert({
    where: { playerCaseId },
    create: {
      playerCaseId,
      suspectId: dto.suspectId,
      motive: dto.motive,
      method: dto.method,
      explanation: dto.explanation,
    },
    update: {
      ...(dto.suspectId !== undefined && { suspectId: dto.suspectId }),
      ...(dto.motive !== undefined && { motive: dto.motive }),
      ...(dto.method !== undefined && { method: dto.method }),
      ...(dto.explanation !== undefined && {
        explanation: dto.explanation,
      }),
    },
    include: {
      evidence: {
        include: { clue: true },
      },
    },
  });
}


async addTheoryEvidence(
  userId: string,
  playerCaseId: string,
  clueId: string,
) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: { id: playerCaseId, userId },
    select: { id: true, gameCaseId: true },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  const clue = await this.prisma.caseClue.findFirst({
    where: {
      id: clueId,
      location: { gameCaseId: playerCase.gameCaseId },
    },
    select: { id: true },
  });

  if (!clue) {
    throw new NotFoundException('Clue not found in this case');
  }

  const discovered = await this.prisma.playerDiscovery.findFirst({
    where: {
      playerCaseId,
      clueId,
      type: 'CLUE',
    },
    select: { id: true },
  });

  if (!discovered) {
    throw new ForbiddenException(
      'You must discover this clue before adding it to your theory',
    );
  }

  const draft = await this.prisma.theoryDraft.upsert({
    where: { playerCaseId },
    create: { playerCaseId },
    update: {},
    select: { id: true },
  });

  const existing = await this.prisma.theoryEvidence.findUnique({
    where: {
      theoryDraftId_clueId: {
        theoryDraftId: draft.id,
        clueId,
      },
    },
  });

  if (existing) {
    return {
      message: 'Clue is already attached to this theory',
      evidence: existing,
    };
  }

  const evidence = await this.prisma.theoryEvidence.create({
    data: {
      theoryDraftId: draft.id,
      clueId,
    },
    include: { clue: true },
  });

  return {
    message: 'Evidence added to theory successfully',
    evidence,
  };
}

async removeTheoryEvidence(
  userId: string,
  playerCaseId: string,
  clueId: string,
) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: { id: playerCaseId, userId },
    select: { id: true },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  const draft = await this.prisma.theoryDraft.findUnique({
    where: { playerCaseId },
    select: { id: true },
  });

  if (!draft) {
    throw new NotFoundException('Theory draft not found');
  }

  const evidence = await this.prisma.theoryEvidence.findUnique({
    where: {
      theoryDraftId_clueId: {
        theoryDraftId: draft.id,
        clueId,
      },
    },
    select: { id: true },
  });

  if (!evidence) {
    throw new NotFoundException('Evidence is not attached to this theory');
  }

  await this.prisma.theoryEvidence.delete({
    where: {
      theoryDraftId_clueId: {
        theoryDraftId: draft.id,
        clueId,
      },
    },
  });

  return { message: 'Evidence removed from theory successfully' };
}


async submitAccusation(
  userId: string,
  playerCaseId: string,
  dto: SubmitAccusationDto,
) {
  const normalize = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, ' ');

  const matchesAnswer = (
    submitted: string,
    canonical: string,
    keywords: string[],
  ) => {
    const answer = normalize(submitted);
    const accepted = [canonical, ...keywords].map(normalize);

    return accepted.some(
      (candidate) =>
        answer === candidate ||
        answer.includes(candidate) ||
        candidate.includes(answer),
    );
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const playerCase = await tx.playerCase.findFirst({
            where: { id: playerCaseId, userId },
          });

          if (!playerCase) {
            throw new NotFoundException('Case progress not found');
          }

          if (playerCase.status !== 'IN_PROGRESS') {
            throw new ConflictException(
              'This case is no longer in progress',
            );
          }

          if (
            playerCase.attemptsUsed >=
            this.MAX_ACCUSATION_ATTEMPTS
          ) {
            throw new ConflictException(
              'You have used all accusation attempts',
            );
          }

          const solution = await tx.caseSolution.findUnique({
            where: { gameCaseId: playerCase.gameCaseId },
          });

          if (!solution) {
            throw new ConflictException(
              'The solution for this case has not been configured',
            );
          }

          const suspect = await tx.caseSuspect.findFirst({
            where: {
              id: dto.suspectId,
              gameCaseId: playerCase.gameCaseId,
            },
            select: { id: true },
          });

          if (!suspect) {
            throw new NotFoundException(
              'Suspect not found in this case',
            );
          }

          const suspectCorrect =
            dto.suspectId === solution.correctSuspectId;

          const motiveCorrect = matchesAnswer(
            dto.motive,
            solution.motive,
            solution.motiveKeywords,
          );

          const methodCorrect = matchesAnswer(
            dto.method,
            solution.method,
            solution.methodKeywords,
          );

          const scoreAwarded =
            (suspectCorrect ? 50 : 0) +
            (motiveCorrect ? 25 : 0) +
            (methodCorrect ? 25 : 0);

          const status =
            suspectCorrect && motiveCorrect && methodCorrect
              ? 'CORRECT'
              : suspectCorrect || motiveCorrect || methodCorrect
                ? 'PARTIALLY_CORRECT'
                : 'INCORRECT';

          const attemptNumber = playerCase.attemptsUsed + 1;

          const attemptRecord = await tx.caseAttempt.create({
            data: {
              playerCaseId,
              attemptNumber,
              suspectId: dto.suspectId,
              motive: dto.motive.trim(),
              method: dto.method.trim(),
              explanation: dto.explanation.trim(),
              status,
              scoreAwarded,
            },
          });

          const attemptsUsed = attemptNumber;
          const attemptsExhausted =
            attemptsUsed >= this.MAX_ACCUSATION_ATTEMPTS;

          const caseCompleted =
            status === 'CORRECT' || attemptsExhausted;

          const updatedPlayerCase = await tx.playerCase.update({
            where: { id: playerCaseId },
            data: {
              attemptsUsed,
              score: { increment: scoreAwarded },
              ...(caseCompleted && {
                status: 'COMPLETED',
                completedAt: new Date(),
              }),
            },
          });

          return {
            message:
              status === 'CORRECT'
                ? 'Case solved successfully!'
                : attemptsExhausted
                  ? 'No attempts remain. The case is over.'
                  : status === 'PARTIALLY_CORRECT'
                    ? 'Some parts of your accusation are correct.'
                    : 'Incorrect accusation. Review your evidence and try again.',
            attempt: attemptRecord,
            evaluation: {
              suspectCorrect,
              motiveCorrect,
              methodCorrect,
            },
            scoreAwarded,
            totalScore: updatedPlayerCase.score,
            attemptsUsed,
            attemptsRemaining: Math.max(
              0,
              this.MAX_ACCUSATION_ATTEMPTS - attemptsUsed,
            ),
            caseStatus: updatedPlayerCase.status,
            solution:
              caseCompleted ? solution : undefined,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034' &&
        attempt < 3
      ) {
        continue;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An accusation attempt was submitted concurrently. Please try again.',
        );
      }

      throw error;
    }
  }

  throw new ConflictException(
    'Unable to submit accusation right now. Please try again.',
  );
}


async getCaseResults(userId: string, playerCaseId: string) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: {
      id: playerCaseId,
      userId,
    },
    include: {
      gameCase: {
        select: {
          id: true,
          title: true,
          coverImageUrl: true,
          solution: {
            select: {
              motive: true,
              method: true,
              explanation: true,
              epilogue: true,
              correctSuspect: {
                select: {
                  id: true,
                  name: true,
                  photoUrl: true,
                  description: true,
                },
              },
            },
          },
        },
      },
      attempts: {
        orderBy: {
          attemptNumber: 'asc',
        },
        select: {
          id: true,
          attemptNumber: true,
          suspectId: true,
          motive: true,
          method: true,
          explanation: true,
          status: true,
          scoreAwarded: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  const completed = playerCase.status === 'COMPLETED';

  return {
    case: {
      id: playerCase.gameCase.id,
      title: playerCase.gameCase.title,
      coverImageUrl: playerCase.gameCase.coverImageUrl,
    },
    progress: {
      status: playerCase.status,
      score: playerCase.score,
      attemptsUsed: playerCase.attemptsUsed,
      attemptsRemaining: Math.max(
        0,
        this.MAX_ACCUSATION_ATTEMPTS - playerCase.attemptsUsed,
      ),
      hintsUsed: playerCase.hintsUsed,
    },
    attempts: playerCase.attempts,
    solution: completed
      ? playerCase.gameCase.solution
      : null,
  };
}

async getCaseHints(userId: string, playerCaseId: string) {
  const playerCase = await this.prisma.playerCase.findFirst({
    where: {
      id: playerCaseId,
      userId,
    },
    select: { id: true, gameCaseId: true, status: true },
  });

  if (!playerCase) {
    throw new NotFoundException('Case progress not found');
  }

  const hints = await this.prisma.caseHint.findMany({
    where: { gameCaseId: playerCase.gameCaseId },
    orderBy: { hintNumber: 'asc' },
    select: {
      id: true,
      hintNumber: true,
      scorePenalty: true,
    },
  });

  const unlockedHints = await this.prisma.playerHint.findMany({
    where: { playerCaseId },
    select: { caseHintId: true },
  });

  const unlockedIds = new Set(
    unlockedHints.map((hint) => hint.caseHintId),
  );

  return {
    hints: hints.map((hint) => ({
      ...hint,
      isUnlocked: unlockedIds.has(hint.id),
    })),
  };
}


async unlockCaseHint(
  userId: string,
  playerCaseId: string,
  hintId: string,
) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const playerCase = await tx.playerCase.findFirst({
            where: {
              id: playerCaseId,
              userId,
            },
          });

          if (!playerCase) {
            throw new NotFoundException('Case progress not found');
          }

          if (playerCase.status !== 'IN_PROGRESS') {
            throw new ConflictException(
              'This case is no longer in progress',
            );
          }

          const hint = await tx.caseHint.findFirst({
            where: {
              id: hintId,
              gameCaseId: playerCase.gameCaseId,
            },
          });

          if (!hint) {
            throw new NotFoundException('Hint not found in this case');
          }

          const existing = await tx.playerHint.findUnique({
            where: {
              playerCaseId_caseHintId: {
                playerCaseId,
                caseHintId: hintId,
              },
            },
          });

          if (existing) {
            return {
              message: 'Hint already unlocked',
              hint: {
                id: hint.id,
                hintNumber: hint.hintNumber,
                content: hint.content,
              },
              scorePenaltyApplied: 0,
              totalScore: playerCase.score,
              hintsUsed: playerCase.hintsUsed,
            };
          }

          const created = await tx.playerHint.create({
            data: {
              playerCaseId,
              caseHintId: hintId,
            },
          });

          const updated = await tx.playerCase.update({
            where: { id: playerCaseId },
            data: {
              score: {
                decrement: hint.scorePenalty,
              },
              hintsUsed: {
                increment: 1,
              },
            },
            select: {
              score: true,
              hintsUsed: true,
            },
          });

          return {
            message: 'Hint unlocked successfully',
            hint: {
              id: hint.id,
              hintNumber: hint.hintNumber,
              content: hint.content,
            },
            unlockedAt: created.unlockedAt,
            scorePenaltyApplied: hint.scorePenalty,
            totalScore: updated.score,
            hintsUsed: updated.hintsUsed,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034' &&
        attempt < 3
      ) {
        continue;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Hint unlock conflicted with another request. Please retry.',
        );
      }

      throw error;
    }
  }

  throw new ConflictException(
    'Unable to unlock the hint right now. Please try again.',
  );
}






}
