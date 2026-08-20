import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AdzunaService } from './adzuna.service';
import { AiMatchingService } from './ai-matching.service';
import { MatchJobsDto } from './dto/match-jobs.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobOffer } from './interfaces/job-offer.interface';
import { MatchedJobOffer } from './interfaces/matched-job-offer.interface';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly adzunaService: AdzunaService,
    private readonly aiMatchingService: AiMatchingService,
  ) {}

  @Get('search')
  async search(@Query() query: SearchJobsDto): Promise<JobOffer[]> {
    return this.adzunaService.search(query.what, query.where, query.page ?? 1);
  }

  @Post('match')
  async match(@Body() body: MatchJobsDto): Promise<MatchedJobOffer[]> {
    return this.aiMatchingService.match(body.profile, body.jobs);
  }
}
