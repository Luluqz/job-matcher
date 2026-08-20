import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { JobsService } from '../core/services/jobs.service';
import { JobOffer, MatchedJobOffer } from '../core/models/job-offer.model';

const MAX_JOBS_TO_MATCH = 10;

@Component({
  selector: 'app-job-search',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './job-search.html',
  styleUrl: './job-search.scss',
})
export class JobSearch {
  private readonly fb = inject(FormBuilder);
  private readonly jobsService = inject(JobsService);

  readonly form = this.fb.nonNullable.group({
    what: ['', Validators.required],
    where: [''],
    profile: [''],
  });

  readonly jobs = signal<MatchedJobOffer[]>([]);
  readonly searchedOnce = signal(false);
  readonly loadingSearch = signal(false);
  readonly loadingMatch = signal(false);
  readonly searchError = signal<string | null>(null);
  readonly matchError = signal<string | null>(null);

  readonly submitLabel = computed(() => {
    if (this.loadingSearch()) return 'Recherche…';
    if (this.loadingMatch()) return 'Analyse en cours…';
    return 'Rechercher';
  });

  search(): void {
    if (this.form.controls.what.invalid) {
      return;
    }

    this.loadingSearch.set(true);
    this.searchError.set(null);
    this.matchError.set(null);

    const { what, where, profile } = this.form.getRawValue();
    const trimmedProfile = profile.trim();

    this.jobsService.search(what, where).subscribe({
      next: (results) => {
        this.searchedOnce.set(true);
        this.loadingSearch.set(false);

        const unscored = results.map((job) => ({ ...job, score: null, justification: null }));

        if (trimmedProfile && results.length > 0) {
          // On n'affiche les offres qu'une fois scorées : pas d'affichage intermédiaire non noté.
          this.analyze(trimmedProfile, results, unscored);
        } else {
          this.jobs.set(unscored);
        }
      },
      error: () => {
        this.searchError.set('La recherche a échoué. Réessaie dans un instant.');
        this.loadingSearch.set(false);
      },
    });
  }

  private analyze(
    profile: string,
    jobs: JobOffer[],
    fallback: MatchedJobOffer[],
  ): void {
    this.loadingMatch.set(true);
    this.matchError.set(null);

    const jobsToScore: JobOffer[] = jobs
      .slice(0, MAX_JOBS_TO_MATCH)
      .map(
        ({
          id,
          title,
          company,
          location,
          description,
          url,
          salaryMin,
          salaryMax,
          createdAt,
        }) => ({
          id,
          title,
          company,
          location,
          description,
          url,
          salaryMin,
          salaryMax,
          createdAt,
        }),
      );

    this.jobsService.match(profile, jobsToScore).subscribe({
      next: (matched) => {
        this.jobs.set(matched);
        this.loadingMatch.set(false);
      },
      error: () => {
        this.matchError.set(
          "L'analyse IA a échoué. Les offres restent affichées sans score.",
        );
        this.jobs.set(fallback);
        this.loadingMatch.set(false);
      },
    });
  }
}
