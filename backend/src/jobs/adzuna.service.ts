import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CacheService } from './cache.service';
import { AdzunaSearchResponse } from './interfaces/adzuna-job.interface';
import { JobOffer } from './interfaces/job-offer.interface';

const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AdzunaService {
  private readonly logger = new Logger(AdzunaService.name);
  private readonly baseUrl = 'https://api.adzuna.com/v1/api/jobs';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly cache: CacheService,
  ) {}

  async search(
    what: string,
    where: string | undefined,
    page: number,
  ): Promise<JobOffer[]> {
    const cacheKey = this.buildCacheKey(what, where, page);
    const cached = this.cache.get<JobOffer[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const appId = this.config.get<string>('ADZUNA_APP_ID');
    const appKey = this.config.get<string>('ADZUNA_APP_KEY');
    const country = this.config.get<string>('ADZUNA_COUNTRY') ?? 'fr';

    if (!appId || !appKey) {
      throw new InternalServerErrorException(
        'Adzuna API credentials are not configured',
      );
    }

    try {
      const { data } = await firstValueFrom(
        this.http.get<AdzunaSearchResponse>(
          `${this.baseUrl}/${country}/search/${page}`,
          {
            params: {
              app_id: appId,
              app_key: appKey,
              what,
              where,
              results_per_page: 10,
            },
          },
        ),
      );

      const jobs = data.results.map((job) => this.toJobOffer(job));
      this.cache.set(cacheKey, jobs, CACHE_TTL_MS);
      return jobs;
    } catch (error) {
      this.logger.error(
        'Adzuna search failed',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Unable to fetch job offers from Adzuna',
      );
    }
  }

  private buildCacheKey(
    what: string,
    where: string | undefined,
    page: number,
  ): string {
    return `${what.trim().toLowerCase()}|${(where ?? '').trim().toLowerCase()}|${page}`;
  }

  private toJobOffer(job: AdzunaSearchResponse['results'][number]): JobOffer {
    return {
      id: job.id,
      title: job.title,
      company: job.company?.display_name ?? null,
      location: job.location?.display_name ?? null,
      description: job.description,
      url: job.redirect_url,
      salaryMin: job.salary_min ?? null,
      salaryMax: job.salary_max ?? null,
      createdAt: job.created,
    };
  }
}
