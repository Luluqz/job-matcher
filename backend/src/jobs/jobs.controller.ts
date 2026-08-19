import { Controller, Get, Query } from '@nestjs/common';
import { AdzunaService } from './adzuna.service';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobOffer } from './interfaces/job-offer.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly adzunaService: AdzunaService) {}

  @Get('search')
  async search(@Query() query: SearchJobsDto): Promise<JobOffer[]> {
    return this.adzunaService.search(query.what, query.where, query.page ?? 1);
  }
}
