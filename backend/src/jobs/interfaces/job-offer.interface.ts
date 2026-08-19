export interface JobOffer {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  url: string;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
}
