import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AiMatchingService } from './ai-matching.service';
import { JobOffer } from './interfaces/job-offer.interface';

function buildJob(id: string): JobOffer {
  return {
    id,
    title: `Job ${id}`,
    company: 'ACME',
    location: 'Paris',
    description: 'Description',
    url: 'https://example.com',
    salaryMin: null,
    salaryMax: null,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('AiMatchingService', () => {
  async function createService(config: Record<string, string | undefined>) {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiMatchingService,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => config[key] },
        },
      ],
    }).compile();

    return module.get<AiMatchingService>(AiMatchingService);
  }

  it('returns offers without scores when ANTHROPIC_API_KEY is missing', async () => {
    const service = await createService({});
    const jobs = [buildJob('1'), buildJob('2')];

    const result = await service.match('profil quelconque', jobs);

    expect(result).toEqual(
      jobs.map((job) => ({ ...job, score: null, justification: null })),
    );
  });
});
