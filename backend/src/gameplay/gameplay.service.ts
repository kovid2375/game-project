import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { PlayerCaseStatus } from "../generated/prisma/enums.js";
import { title } from "process";
import { take, throwError } from "rxjs";









@Injectable()
export class GameplayService{
    constructor(private readonly prisma:PrismaService){}
    async startOrResumeCase(caseId:string,userId:string){
        const gameCase=await this.prisma.gameCase.findFirst({
            where:{
                id:caseId,
                isPublished:true
            },
            select:{
                id:true,
                title:true,
                caseNumber:true
            }
        })
        if(!gameCase){
            throw new NotFoundException('Publish case not found or not active')
        }
        // Resuse the players existing investigation if one exists
        const existing=await this.prisma.playerCase.findUnique({
            where:{
                userId_gameCaseId:{
                    userId,
                    gameCaseId:caseId
                }
            }
        })
        if(existing){
            if(existing.status===PlayerCaseStatus.ABANDONED){
                throw new ConflictException(
                    'This investigation was abandoned and cannot be resumed. Please start a new case.'
                )
            }
            return{
                message:existing?.status===PlayerCaseStatus.COMPLETED?'Case already completed':'Investigattion Resumed',
                case:gameCase,
                progress:existing,
                isNew:false
            }
        }
        //Use the configured starting Ap Later ; 10 is the current startingAp for all cases
        
        const progress=await this.prisma.playerCase.create({
            data:{
                userId,
                gameCaseId:caseId,
                actionPoints:10,
                currentPhase:1,
                status:PlayerCaseStatus.IN_PROGRESS
            }
        })
        return{
            message:'Investigation started',
            case:gameCase,
            progress,
            isNew:true
        }
    }
    
    async getCaseFile(userId:string,playerCaseId:string){
        const progress=await this.prisma.playerCase.findFirst({
            where:{
                id:playerCaseId,
                userId
            },
            include:{
                gameCase:{
                    include:{
                        victim:true,
                        policeReport:true,
                        statements:{
                            where:{isInitial:true},
                            orderBy:{sortOrder:'asc'}
                        }
                    }
                }
            }
        })
        if(!progress){
            throw new NotFoundException('Investigation not found')
        }
        if(progress.status!==PlayerCaseStatus.IN_PROGRESS){
            throw new ConflictException('This investigation is not active')
        }
        //Record that the case file has been opened.

        if(!progress.caseFileOpenedAt){
            await this.prisma.playerCase.update({
                where:{id:progress.id},
                data:{
                    caseFileOpenedAt:new Date(),
                    lastActivityAt:new Date()
                }
            })
        }
        return{
            progress:{
                id:progress.id,
                status:progress.status,
                currentPhase:progress.currentPhase,
                casefileOpenedAt:progress.caseFileOpenedAt??new Date()
            },
            case:{
                id:progress.gameCaseId,
                caseNumber:progress.gameCase.caseNumber,
                title:progress.gameCase.title,
                description:progress.gameCase.description,
                victim:progress.gameCase.victim,
                policeReport:progress.gameCase.policeReport,
                initialStatements:progress.gameCase.statements

            }
        }
    }

    async readyForSuspects(userId:string,playerCaseId:string){
        const progress=await this.prisma.playerCase.findFirst({
            where:{
                id:playerCaseId,
                userId
            },
            include:{
                gameCase:{
                    select:{
                        id:true,
                        title:true
                    }
                }
            }
        })
        if(!progress){
            throw new NotFoundException("Investigation not found by this player")
        }
        if(progress.status!==PlayerCaseStatus.IN_PROGRESS){
            throw new ConflictException('This investigation is not active ')
        }
        if(!progress.caseFileOpenedAt){
            throw new ConflictException('Open the case file before meeting the suspects')
        }
        if(progress.currentPhase>=2){
            return{
                message:"Suspects phase already unlocked",
                currentPhase:progress.currentPhase
            }
        }
        const update=await this.prisma.playerCase.update({
            where:{
                id:playerCaseId
            },
            data:{
                currentPhase:2,
                lastActivityAt:new Date()
            }
        })
        return{
            message:"Suspects phase unlocked",
            case:progress.gameCase,
            currentPhase:update.currentPhase,
        }
    }

    async getSuspects(userId:string,playerCaseId:string){
        const progress=await this.prisma.playerCase.findFirst({
            where:{
                id:playerCaseId,
                userId,
            },
            select:{
                id:true,
                status:true,
                currentPhase:true,
                gameCaseId:true
            }
        })
        if(!progress){
            throw new NotFoundException('Investigation not found')
        }
        if(progress.status!==PlayerCaseStatus.IN_PROGRESS){
            throw new ConflictException('Investigation is not in progress')
        }
        if(progress.currentPhase<2){
            throw new ForbiddenException("Open the case file unlock the suspects phase first")
        }
        const suspects=await this.prisma.caseSuspect.findMany({
            where:{
                gameCaseId:progress.gameCaseId,

            },
            orderBy:{
                sortOrder:'asc'
            },
            select:{
                id:true,
                name:true,
                photoUrl:true,
                relationship:true,
                description:true,
                sortOrder:true,
                isInitiallyUnlocked:true,
                playerUnlocks:{
                    where:{
                        playerCaseId,
                    },
                    select:{
                        id:true
                    },
                    take:1
                }
            }
        })
        return {
    playerCaseId,
    totalSuspects: suspects.length,
    suspects: suspects.map((suspect) => {
      const isUnlocked =
        suspect.isInitiallyUnlocked ||
        suspect.playerUnlocks.length > 0;

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
    throw new ForbiddenException(
      'The suspects phase has not been unlocked',
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
    suspect.isInitiallyUnlocked ||
    suspect.playerUnlocks.length > 0;

  if (!isUnlocked) {
    throw new ForbiddenException(
      'This suspect has not been unlocked yet',
    );
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
}

    
