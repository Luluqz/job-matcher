import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { JobOffer, MatchedJobOffer } from '../models/job-offer.model';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly http = inject(HttpClient);

  search(what: string, where: string): Observable<JobOffer[]> {
    let params = new HttpParams().set('what', what);
    if (where) {
      params = params.set('where', where);
    }

    return this.http.get<JobOffer[]>(`${API_BASE_URL}/jobs/search`, { params });
  }

  match(profile: string, jobs: JobOffer[]): Observable<MatchedJobOffer[]> {
    return this.http.post<MatchedJobOffer[]>(`${API_BASE_URL}/jobs/match`, {
      profile,
      jobs,
    });
  }
}
