import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AdzunaSearchResponse } from './interfaces/adzuna-job.interface';
import { JobOffer } from './interfaces/job-offer.interface';

@Injectable()
export class AdzunaService {
  private readonly logger = new Logger(AdzunaService.name);
  private readonly baseUrl = 'https://api.adzuna.com/v1/api/jobs';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async search(
    what: string,
    where: string | undefined,
    page: number,
  ): Promise<JobOffer[]> {
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
              content_type: 'application/json',
            },
          },
        ),
      );

      return data.results.map((job) => this.toJobOffer(job));
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
