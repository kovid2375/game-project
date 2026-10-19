import { Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { GameplayService } from "./gameplay.service.js";


@Controller('gameplay')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()

export class GameplayController{
    constructor(private readonly gameplauService:GameplayService){}

    @Post('Cases/:caseId/start')
    @ApiOperation({ summary: 'start a case' })
    @ApiResponse({ status: 200, description: 'Case started successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    startCase(
        @Param('caseId',new ParseUUIDPipe())caseId:string,
        @Req()req:{user:{id?:string;userId?:string;sub?:string}},

    ){
        const userId=req.user.id?? req.user.userId ?? req.user.sub
        if(!userId){
            // fail closed if your Jwt startegy does not provide a user ID
            throw new Error('Authenticated User Id is missing')
        }
        return this.gameplauService.startOrResumeCase(caseId, userId)
    }

    @Get(':playerCaseId/case-file')
    @ApiOperation({ summary: 'Get case file' })
    @ApiResponse({ status: 200, description: 'Case file fetched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Case file not found' })
    getCaseFile(
        @Param('playerCaseId',new ParseUUIDPipe())playerCaseId:string,
        @Req()req:{user:{id?:string;userId?:string;sub?:string}},
    ){
        const userId=req.user.id?? req.user.userId ?? req.user.sub
        if(!userId){
            // fail closed if your Jwt startegy does not provide a user ID
            throw new Error('Authenticated User Id is missing')
        }
        return this.gameplauService.getCaseFile(userId, playerCaseId)
    }


    @Post(':playerCaseId/ready-for-suspects')
    @ApiOperation({ summary: 'unlock suspects' })
    @ApiResponse({ status: 200, description: 'Suspects unlocked successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Case file not found' })
    readyForSuspects(
        @Param('playerCaseId',new ParseUUIDPipe())playerCaseId:string,
        @Req()req:{user:{id?:string;userId?:string;sub?:string}},
    ){
        const userId=req.user.id?? req.user.userId ?? req.user.sub
        if(!userId){
            // fail closed if your Jwt startegy does not provide a user ID
            throw new Error('Authenticated User Id is missing')
        }
        return this.gameplauService.readyForSuspects(userId, playerCaseId)
    }

    @Get(':playerCaseId/suspects')
    @ApiOperation({summary:'get suspects'})
    @ApiResponse({status:200,description:'Suspects fetched successfully'})
    @ApiResponse({status:401,description:'Unauthorized'})
    @ApiResponse({status:404,description:'Investigation not found'})
    @ApiResponse({status:403,description:'Suspects not unlocked'})
    getSuspects(
        @Param('playerCaseId',new ParseUUIDPipe())
        playerCaseId:string,
        @Req()
        req:{user:{id?:string;userId?:string;sub?:string}}
    ){
        const userId=req.user.id?? req.user.userId ?? req.user.sub
        if(!userId){
            // fail closed if your Jwt startegy does not provide a user ID
            throw new Error('Authenticated User Id is missing')
        }
        return this.gameplauService.getSuspects(userId, playerCaseId)
    }

    @Get(':playerCaseId/suspects/:suspectId')
    @ApiOperation({summary:'get suspect'})
    @ApiResponse({status:200,description:'Suspect fetched successfully'})
    @ApiResponse({status:401,description:'Unauthorized'})
    @ApiResponse({status:404,description:'Suspect not found'})
    @ApiResponse({status:403,description:'Suspect not unlocked'})
    getSuspectDossier(
        @Param('playerCaseId',new ParseUUIDPipe())
        playerCaseId:string,
        @Param('suspectId',new ParseUUIDPipe())
        suspectId:string,
        @Req()
        req:{user:{id?:string;userId?:string;sub?:string}}
    ){
        const userId=req.user.id?? req.user.userId ?? req.user.sub
        if(!userId){
            // fail closed if your Jwt startegy does not provide a user ID
            throw new Error('Authenticated User Id is missing')
        }
        return this.gameplauService.getSuspectDossier(userId, playerCaseId, suspectId)
    }
}