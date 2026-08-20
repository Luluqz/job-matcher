import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AdzunaService } from './adzuna.service';
import { AiMatchingService } from './ai-matching.service';
import { CacheService } from './cache.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [HttpModule],
  controllers: [JobsController],
  providers: [AdzunaService, AiMatchingService, CacheService],
})
export class JobsModule {}
