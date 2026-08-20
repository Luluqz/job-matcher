import { JobOffer } from './job-offer.interface';

export interface MatchedJobOffer extends JobOffer {
  score: number | null;
  justification: string | null;
}
