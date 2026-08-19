import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AdzunaService } from './adzuna.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [HttpModule],
  controllers: [JobsController],
  providers: [AdzunaService],
})
export class JobsModule {}
