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

@Injectable()
export class GameplayService {
  constructor(private readonly prisma: PrismaService) {}
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
  return this.prisma.$transaction(async (tx) => {
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
      location.isInitiallyOpen || location.playerUnlocks.length > 0;

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

    // Repeated searches return previously discovered evidence without charging again.
    if (existingVisit?.searchedAt) {
      const discoveries = await tx.playerDiscovery.findMany({
        where: {
          playerCaseId,
          OR: [
            { clueId: { in: location.clues.map((clue) => clue.id) } },
            {
              documentId: {
                in: location.documents.map((document) => document.id),
              },
            },
          ],
        },
        select: {
          type: true,
          clueId: true,
          documentId: true,
          discoveredAt: true,
        },
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
        remainingActionPoints: progress.actionPoints,
        clues: location.clues.filter((clue) =>
          discoveries.some((item) => item.clueId === clue.id),
        ),
        documents: location.documents.filter((document) =>
          discoveries.some((item) => item.documentId === document.id),
        ),
      };
    }

    const cost = location.searchActionPointCost;

    if (cost < 0) {
      throw new BadRequestException('Invalid location search cost');
    }

    if (progress.actionPoints < cost) {
      throw new BadRequestException('Insufficient action points');
    }

    // Conditional update prevents spending the same action points twice
    // when multiple searches happen concurrently.
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

    const newClues = [];
    for (const clue of location.clues) {
      const existing = await tx.playerDiscovery.findFirst({
        where: { playerCaseId, clueId: clue.id, type: 'CLUE' },
        select: { id: true },
      });

      if (!existing) {
        await tx.playerDiscovery.create({
          data: {
            playerCaseId,
            type: 'CLUE',
            clueId: clue.id,
          },
        });
        newClues.push(clue);
      }
    }

    const newDocuments = [];
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
        await tx.playerDiscovery.create({
          data: {
            playerCaseId,
            type: 'DOCUMENT',
            documentId: document.id,
          },
        });
        newDocuments.push(document);
      }
    }
    // Check leads and unlock destination locations
const leads = await tx.caseLead.findMany({
  where: {
    sourceLocationId: locationId,
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
  // If a clue is required, verify that the player discovered it
  if (lead.requiredClueId) {
    const requiredClue = await tx.playerDiscovery.findFirst({
      where: {
        playerCaseId,
        clueId: lead.requiredClueId,
        type: 'CLUE',
      },
      select: {
        id: true,
      },
    });

    if (!requiredClue) {
      continue;
    }
  }

  // Check whether the destination is already unlocked
  const existingUnlock = await tx.playerLocationUnlock.findUnique({
    where: {
      playerCaseId_locationId: {
        playerCaseId,
        locationId: lead.destinationLocationId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingUnlock) {
    continue;
  }

  // Unlock the destination for this player
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
      remainingActionPoints: updatedProgress?.actionPoints ?? 0,
      clues: newClues,
      documents: newDocuments,
      unlockedLocations: newlyUnlockedLocations,
      message:
        newClues.length || newDocuments.length
          ? 'New evidence discovered'
          : 'No new evidence found',
    };
  });
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
      select: { id: true },
    });

    if (!existing) {
      await tx.playerDiscovery.create({
        data: {
          playerCaseId,
          type: 'CLUE',
          clueId: unlock.clueId,
        },
      });
    }
  }

  // Record a document discovery only once per investigation.
  if (unlock.documentId) {
    const existing = await tx.playerDiscovery.findFirst({
      where: {
        playerCaseId,
        documentId: unlock.documentId,
        type: 'DOCUMENT',
      },
      select: { id: true },
    });

    if (!existing) {
      await tx.playerDiscovery.create({
        data: {
          playerCaseId,
          type: 'DOCUMENT',
          documentId: unlock.documentId,
        },
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
}
