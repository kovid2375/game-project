
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCaseLeaderboard(caseId: string) {
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

    const completedCases = await this.prisma.playerCase.findMany({
      where: {
        gameCaseId: caseId,
        status: 'COMPLETED',
        completedAt: { not: null },
      },
      orderBy: [
        { score: 'desc' },
        { completedAt: 'asc' },
      ],
      take: 100,
      select: {
        id: true,
        userId: true,
        score: true,
        hintsUsed: true,
        attemptsUsed: true,
        startedAt: true,
        completedAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      case: gameCase,
      totalPlayers: completedCases.length,
      leaderboard: completedCases.map((entry, index) => ({
        rank: index + 1,
        playerName: entry.user.name,
        score: entry.score,
        hintsUsed: entry.hintsUsed,
        attemptsUsed: entry.attemptsUsed,
        completionTimeSeconds: Math.max(
          0,
          Math.floor(
            (entry.completedAt!.getTime() -
              entry.startedAt.getTime()) /
              1000,
          ),
        ),
        completedAt: entry.completedAt,
      })),
    };
  }

  
async getGlobalLeaderboard() {
  const completedCases = await this.prisma.playerCase.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: { not: null },
    },
    orderBy: [
      { score: 'desc' },
      { completedAt: 'asc' },
    ],
    take: 100,
    select: {
      id: true,
      userId: true,
      gameCaseId: true,
      score: true,
      hintsUsed: true,
      attemptsUsed: true,
      startedAt: true,
      completedAt: true,
      gameCase: {
        select: {
          title: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    totalEntries: completedCases.length,
    leaderboard: completedCases.map((entry, index) => ({
      rank: index + 1,
      playerName: entry.user.name,
      caseId: entry.gameCaseId,
      caseTitle: entry.gameCase.title,
      score: entry.score,
      hintsUsed: entry.hintsUsed,
      attemptsUsed: entry.attemptsUsed,
      completionTimeSeconds: Math.max(
        0,
        Math.floor(
          (entry.completedAt!.getTime() -
            entry.startedAt.getTime()) /
            1000,
        ),
      ),
      completedAt: entry.completedAt,
    })),
  };
}

async getMyCaseRank(userId: string, caseId: string) {
  const gameCase = await this.prisma.gameCase.findUnique({
    where: { id: caseId },
    select: { id: true, title: true },
  });

  if (!gameCase) {
    throw new NotFoundException('Case not found');
  }

  const playerCase = await this.prisma.playerCase.findFirst({
    where: {
      userId,
      gameCaseId: caseId,
      status: 'COMPLETED',
      completedAt: { not: null },
    },
    select: {
      id: true,
      score: true,
      completedAt: true,
    },
  });

  if (!playerCase) {
    return {
      case: gameCase,
      ranked: false,
      message: 'Complete this case to appear on the leaderboard',
    };
  }

  const playersAhead = await this.prisma.playerCase.count({
    where: {
      gameCaseId: caseId,
      status: 'COMPLETED',
      completedAt: { not: null },
      OR: [
        { score: { gt: playerCase.score } },
        {
          score: playerCase.score,
          completedAt: { lt: playerCase.completedAt! },
        },
      ],
    },
  });

  return {
    case: gameCase,
    ranked: true,
    rank: playersAhead + 1,
    score: playerCase.score,
    completedAt: playerCase.completedAt,
  };
}

}
