import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AdzunaService } from './adzuna.service';
import { CacheService } from './cache.service';
import { AdzunaSearchResponse } from './interfaces/adzuna-job.interface';

function buildResponse(): { data: AdzunaSearchResponse } {
  return {
    data: {
      count: 1,
      results: [
        {
          id: '1',
          title: 'Développeur Angular',
          description: 'Description',
          redirect_url: 'https://example.com/1',
          created: '2026-01-01T00:00:00Z',
          company: { display_name: 'ACME' },
          location: { display_name: 'Paris' },
        },
      ],
    },
  };
}

describe('AdzunaService', () => {
  let httpGet: jest.Mock;
  let service: AdzunaService;

  beforeEach(async () => {
    httpGet = jest.fn().mockReturnValue(of(buildResponse()));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdzunaService,
        CacheService,
        { provide: HttpService, useValue: { get: httpGet } },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                ADZUNA_APP_ID: 'id',
                ADZUNA_APP_KEY: 'key',
                ADZUNA_COUNTRY: 'fr',
              })[key],
          },
        },
      ],
    }).compile();

    service = module.get(AdzunaService);
  });

  it('calls the Adzuna API on the first search', async () => {
    const jobs = await service.search('angular', 'paris', 1);

    expect(httpGet).toHaveBeenCalledTimes(1);
    expect(jobs).toEqual([
      {
        id: '1',
        title: 'Développeur Angular',
        company: 'ACME',
        location: 'Paris',
        description: 'Description',
        url: 'https://example.com/1',
        salaryMin: null,
        salaryMax: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);
  });

  it('serves an identical search from cache without calling the API again', async () => {
    await service.search('angular', 'paris', 1);
    await service.search('angular', 'paris', 1);

    expect(httpGet).toHaveBeenCalledTimes(1);
  });

  it('is case/whitespace-insensitive when building the cache key', async () => {
    await service.search('Angular', ' Paris ', 1);
    await service.search('angular', 'paris', 1);

    expect(httpGet).toHaveBeenCalledTimes(1);
  });

  it('calls the API again for a different query', async () => {
    await service.search('angular', 'paris', 1);
    await service.search('react', 'paris', 1);

    expect(httpGet).toHaveBeenCalledTimes(2);
  });
});
