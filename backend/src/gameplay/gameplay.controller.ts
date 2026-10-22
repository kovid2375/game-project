import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Delete,
  Patch,
  Body
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GameplayService } from './gameplay.service.js';
import { CreateNotebookEntryDto } from './dto/create-notebook-entry.dto.js';
import { UpdateNotebookEntryDto } from './dto/update-notebook-entry.dto.js';
import { UpdateTheoryDraftDto } from './dto/update-theory-draft.dto.js';
import { SubmitAccusationDto } from './dto/submit-accusation.dto.js';

@Controller('gameplay')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GameplayController {
  constructor(private readonly gameplayService: GameplayService) {}

  @Post('Cases/:caseId/start')
  @ApiOperation({ summary: 'start a case' })
  @ApiResponse({ status: 200, description: 'Case started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  startCase(
    @Param('caseId', new ParseUUIDPipe()) caseId: string,
    @Req() req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;
    if (!userId) {
      // fail closed if your Jwt startegy does not provide a user ID
      throw new Error('Authenticated User Id is missing');
    }
    return this.gameplayService.startOrResumeCase(caseId, userId);
  }

  @Get(':playerCaseId/case-file')
  @ApiOperation({ summary: 'Get case file' })
  @ApiResponse({ status: 200, description: 'Case file fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Case file not found' })
  getCaseFile(
    @Param('playerCaseId', new ParseUUIDPipe()) playerCaseId: string,
    @Req() req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;
    if (!userId) {
      // fail closed if your Jwt startegy does not provide a user ID
      throw new Error('Authenticated User Id is missing');
    }
    return this.gameplayService.getCaseFile(userId, playerCaseId);
  }

  @Post(':playerCaseId/ready-for-suspects')
  @ApiOperation({ summary: 'unlock suspects' })
  @ApiResponse({ status: 200, description: 'Suspects unlocked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Case file not found' })
  readyForSuspects(
    @Param('playerCaseId', new ParseUUIDPipe()) playerCaseId: string,
    @Req() req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;
    if (!userId) {
      // fail closed if your Jwt startegy does not provide a user ID
      throw new Error('Authenticated User Id is missing');
    }
    return this.gameplayService.readyForSuspects(userId, playerCaseId);
  }

  @Get(':playerCaseId/suspects')
  @ApiOperation({ summary: 'get suspects' })
  @ApiResponse({ status: 200, description: 'Suspects fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Investigation not found' })
  @ApiResponse({ status: 403, description: 'Suspects not unlocked' })
  getSuspects(
    @Param('playerCaseId', new ParseUUIDPipe())
    playerCaseId: string,
    @Req()
    req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;
    if (!userId) {
      // fail closed if your Jwt startegy does not provide a user ID
      throw new Error('Authenticated User Id is missing');
    }
    return this.gameplayService.getSuspects(userId, playerCaseId);
  }

  
  @Get(':playerCaseId/locations')
  @ApiOperation({ summary: 'Get locations available in the investigation' })
  @ApiResponse({
    status: 200,
    description: 'Investigation locations fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Investigation unavailable' })
  @ApiResponse({ status: 404, description: 'Investigation not found' })
  getLocations(
    @Param('playerCaseId', new ParseUUIDPipe())
    playerCaseId: string,
    @Req()
    req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing');
    }

    return this.gameplayService.getLocations(userId, playerCaseId);
  }
  
@Get(':playerCaseId/locations/:locationId')
@ApiOperation({ summary: 'Get details of an unlocked investigation location' })
getLocationDetails(
  @Param('playerCaseId', new ParseUUIDPipe()) playerCaseId: string,
  @Param('locationId', new ParseUUIDPipe()) locationId: string,
  @Req() req: { user: { id?: string; userId?: string; sub?: string } },
) {
  const userId = req.user.id ?? req.user.userId ?? req.user.sub;

  if (!userId) {
    throw new UnauthorizedException('Authenticated user ID is missing');
  }

  return this.gameplayService.getLocationDetails(
    userId,
    playerCaseId,
    locationId,
  );
}


@Post(':playerCaseId/locations/:locationId/investigate')
@ApiOperation({ summary: 'Search a location for clues and documents' })
@ApiResponse({ status: 200, description: 'Location investigated successfully' })
@ApiResponse({ status: 400, description: 'Insufficient action points' })
@ApiResponse({ status: 403, description: 'Location is locked or investigation unavailable' })
@ApiResponse({ status: 404, description: 'Investigation or location not found' })
investigateLocation(
  @Param('playerCaseId', new ParseUUIDPipe()) playerCaseId: string,
  @Param('locationId', new ParseUUIDPipe()) locationId: string,
  @Req() req: { user: { id?: string; userId?: string; sub?: string } },
) {
  const userId = req.user.id ?? req.user.userId ?? req.user.sub;

  if (!userId) {
    throw new UnauthorizedException('Authenticated user ID is missing');
  }

  return this.gameplayService.investigateLocation(
    userId,
    playerCaseId,
    locationId,
  );
}




  @Get(':playerCaseId/suspects/:suspectId')
  @ApiOperation({ summary: 'get suspect' })
  @ApiResponse({ status: 200, description: 'Suspect fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Suspect not found' })
  @ApiResponse({ status: 403, description: 'Suspect not unlocked' })
  getSuspectDossier(
    @Param('playerCaseId', new ParseUUIDPipe())
    playerCaseId: string,
    @Param('suspectId', new ParseUUIDPipe())
    suspectId: string,
    @Req()
    req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;
    if (!userId) {
      // fail closed if your Jwt startegy does not provide a user ID
      throw new Error('Authenticated User Id is missing');
    }
    return this.gameplayService.getSuspectDossier(
      userId,
      playerCaseId,
      suspectId,
    );
  }

  @Get(':playerCaseId/suspects/:suspectId/interview-questions')
  @ApiOperation({ summary: 'Get available interview questions for a suspect' })
  @ApiResponse({
    status: 200,
    description: 'Interview questions fetched successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Suspect is locked or interview is unavailable',
  })
  @ApiResponse({
    status: 404,
    description: 'Investigation or suspect not found',
  })
  getInterviewQuestions(
    @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
    @Param('suspectId', ParseUUIDPipe) suspectId: string,
    @Req() req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing');
    }

    return this.gameplayService.getInterviewQuestions(
      userId,
      playerCaseId,
      suspectId,
    );
  }

  @Post(
    ':playerCaseId/suspects/:suspectId/interview-questions/:threadId/answer',
  )
  @ApiOperation({
    summary: 'Choose an interview question and receive the suspect response',
  })
  @ApiResponse({
    status: 200,
    description: 'Interview response retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Question unavailable or response missing',
  })
  @ApiResponse({
    status: 403,
    description: 'Interviewing or suspect access denied',
  })
  @ApiResponse({
    status: 404,
    description: 'Investigation or suspect not found',
  })
  answerInterviewQuestion(
    @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
    @Param('suspectId', ParseUUIDPipe) suspectId: string,
    @Param('threadId', ParseUUIDPipe) threadId: string,
    @Req() req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing');
    }

    return this.gameplayService.answerInterviewQuestion(
      userId,
      playerCaseId,
      suspectId,
      threadId,
    );
  }

  @Post(':playerCaseId/suspects/:suspectId/interview-visits')
  @ApiOperation({ summary: 'Start or resume an interview visit' })
  @ApiResponse({
    status: 201,
    description: 'Interview visit started or resumed',
  })
  @ApiResponse({
    status: 403,
    description: 'Suspect is locked or interview unavailable',
  })
  @ApiResponse({
    status: 404,
    description: 'Investigation or suspect not found',
  })
  startInterviewVisit(
    @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
    @Param('suspectId', ParseUUIDPipe) suspectId: string,
    @Req() req: { user: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId = req.user.id ?? req.user.userId ?? req.user.sub;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing');
    }

    return this.gameplayService.startInterviewVisit(
      userId,
      playerCaseId,
      suspectId,
    );
  }


  
@Post(':playerCaseId/notebook')
createNotebookEntry(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Body() dto: CreateNotebookEntryDto,
) {
  return this.gameplayService.createNotebookEntry(
    req.user.sub,
    playerCaseId,
    dto,
  );
}

@Get(':playerCaseId/notebook')
getNotebookEntries(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
) {
  return this.gameplayService.getNotebookEntries(
    req.user.sub,
    playerCaseId,
  );
}

@Get(':playerCaseId/notebook/:entryId')
getNotebookEntry(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Param('entryId', ParseUUIDPipe) entryId: string,
) {
  return this.gameplayService.getNotebookEntry(
    req.user.sub,
    playerCaseId,
    entryId,
  );
}

@Patch(':playerCaseId/notebook/:entryId')
updateNotebookEntry(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Param('entryId', ParseUUIDPipe) entryId: string,
  @Body() dto: UpdateNotebookEntryDto,
) {
  return this.gameplayService.updateNotebookEntry(
    req.user.sub,
    playerCaseId,
    entryId,
    dto,
  );
}

@Delete(':playerCaseId/notebook/:entryId')
deleteNotebookEntry(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Param('entryId', ParseUUIDPipe) entryId: string,
) {
  return this.gameplayService.deleteNotebookEntry(
    req.user.sub,
    playerCaseId,
    entryId,
  );
}


@Get(':playerCaseId/theory')
getTheoryDraft(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
) {
  return this.gameplayService.getTheoryDraft(
    req.user.sub,
    playerCaseId,
  );
}

@Patch(':playerCaseId/theory')
updateTheoryDraft(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Body() dto: UpdateTheoryDraftDto,
) {
  return this.gameplayService.updateTheoryDraft(
    req.user.sub,
    playerCaseId,
    dto,
  );
}

@Post(':playerCaseId/theory/evidence/:clueId')
addTheoryEvidence(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Param('clueId', ParseUUIDPipe) clueId: string,
) {
  return this.gameplayService.addTheoryEvidence(
    req.user.sub,
    playerCaseId,
    clueId,
  );
}

@Delete(':playerCaseId/theory/evidence/:clueId')
removeTheoryEvidence(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Param('clueId', ParseUUIDPipe) clueId: string,
) {
  return this.gameplayService.removeTheoryEvidence(
    req.user.sub,
    playerCaseId,
    clueId,
  );
}


@Post(':playerCaseId/accusation')
submitAccusation(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Body() dto: SubmitAccusationDto,
) {
  return this.gameplayService.submitAccusation(
    req.user.sub,
    playerCaseId,
    dto,
  );
}


@Get(':playerCaseId/results')
getCaseResults(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
) {
  return this.gameplayService.getCaseResults(
    req.user.sub,
    playerCaseId,
  );
}



@Get(':playerCaseId/hints')
getCaseHints(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
) {
  return this.gameplayService.getCaseHints(
    req.user.sub,
    playerCaseId,
  );
}

@Post(':playerCaseId/hints/:hintId/unlock')
unlockCaseHint(
  @Req() req: any,
  @Param('playerCaseId', ParseUUIDPipe) playerCaseId: string,
  @Param('hintId', ParseUUIDPipe) hintId: string,
) {
  return this.gameplayService.unlockCaseHint(
    req.user.sub,
    playerCaseId,
    hintId,
  );
}



}
