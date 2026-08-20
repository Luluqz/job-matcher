import { Component } from '@angular/core';
import { JobSearch } from './job-search/job-search';

@Component({
  selector: 'app-root',
  imports: [JobSearch],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
