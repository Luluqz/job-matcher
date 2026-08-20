import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod/v4';
import { JobOffer } from './interfaces/job-offer.interface';
import { MatchedJobOffer } from './interfaces/matched-job-offer.interface';

const MAX_JOBS_PER_CALL = 10;

const MatchResultSchema = z.object({
  matches: z.array(
    z.object({
      id: z.string(),
      score: z.number().min(0).max(10),
      justification: z.string(),
    }),
  ),
});

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);
  private readonly client: Anthropic | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    this.client = apiKey ? new Anthropic({ apiKey }) : null;

    if (!this.client) {
      this.logger.warn(
        'ANTHROPIC_API_KEY is not configured — AI matching will be skipped',
      );
    }
  }

  async match(profile: string, jobs: JobOffer[]): Promise<MatchedJobOffer[]> {
    if (!this.client) {
      return this.withoutScores(jobs);
    }

    const jobsToScore = jobs.slice(0, MAX_JOBS_PER_CALL);

    try {
      const response = await this.client.messages.parse({
        model: 'claude-haiku-4-5',
        max_tokens: 16000,
        system: this.buildSystemPrompt(),
        messages: [
          { role: 'user', content: this.buildUserPrompt(profile, jobsToScore) },
        ],
        output_config: { format: zodOutputFormat(MatchResultSchema) },
      });

      if (!response.parsed_output) {
        throw new Error('Claude response could not be parsed');
      }

      const resultById = new Map(
        response.parsed_output.matches.map((match) => [match.id, match]),
      );

      // Tri par score décroissant fait en code — jamais délégué au prompt.
      return jobsToScore
        .map((job): MatchedJobOffer => {
          const result = resultById.get(job.id);
          return {
            ...job,
            score: result?.score ?? null,
            justification: result?.justification ?? null,
          };
        })
        .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    } catch (error) {
      this.logger.error(
        'Claude matching failed — returning offers without scores',
        error instanceof Error ? error.stack : error,
      );
      return this.withoutScores(jobs);
    }
  }

  private withoutScores(jobs: JobOffer[]): MatchedJobOffer[] {
    return jobs.map((job) => ({ ...job, score: null, justification: null }));
  }

  private buildSystemPrompt(): string {
    return [
      "Tu es un assistant qui évalue la pertinence d'offres d'emploi par rapport au profil d'un candidat.",
      'Pour chaque offre fournie, donne un score de 0 (aucun rapport) à 10 (correspondance parfaite) et une justification courte (1 à 2 phrases) en français.',
      "Base-toi uniquement sur le profil et le contenu des offres fournis, sans supposer d'informations absentes.",
      'Retourne un résultat pour chaque offre reçue, identifié par son id.',
    ].join('\n');
  }

  private buildUserPrompt(profile: string, jobs: JobOffer[]): string {
    const jobsText = jobs
      .map((job) =>
        [
          `id: ${job.id}`,
          `titre: ${job.title}`,
          `entreprise: ${job.company ?? 'N/A'}`,
          `localisation: ${job.location ?? 'N/A'}`,
          `description: ${job.description}`,
        ].join('\n'),
      )
      .join('\n---\n');

    return `Profil du candidat:\n${profile}\n\nOffres à évaluer:\n${jobsText}`;
  }
}
