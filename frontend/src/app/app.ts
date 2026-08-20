import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { JobSearch } from './job-search/job-search';

@Component({
  selector: 'app-root',
  imports: [MatToolbarModule, JobSearch],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
