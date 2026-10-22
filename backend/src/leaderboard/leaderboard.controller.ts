
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service.js';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Get('cases/:caseId')
  getCaseLeaderboard(
    @Param('caseId', ParseUUIDPipe) caseId: string,
  ) {
    return this.leaderboardService.getCaseLeaderboard(caseId);
  }

  
@Get('global')
getGlobalLeaderboard() {
  return this.leaderboardService.getGlobalLeaderboard();
}


@Get('cases/:caseId/me')
getMyCaseRank(
  @Req() req: any,
  @Param('caseId', ParseUUIDPipe) caseId: string,
) {
  return this.leaderboardService.getMyCaseRank(
    req.user.sub,
    caseId,
  );
}

}
