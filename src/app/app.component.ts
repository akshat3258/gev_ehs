import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="header">
      <div>
        <h1>GE Vernova Contractor EHS — Platform Value & Analytics Story</h1>
        <div class="subtitle">exponentia.ai | Updated April 2026 — Verified Data</div>
      </div>
    </div>

    <div class="sev-banner">
      <div class="icon">&#x1F6A8;</div>
      <div class="text">
        <strong>Central Insight:</strong> Concern activity is the strongest leading indicator of site safety.
        Sites that actively report concerns have dramatically lower serious incident rates.
        Our platform monitors <strong>which sites have gone silent</strong> — and which hazards nobody is watching — before incidents escalate.
      </div>
    </div>

    <div class="tab-bar">
      <button class="tab-btn" [class.active]="activeTab === 'exec-summary'" (click)="switchTab('exec-summary')">Executive Summary</button>
      <button class="tab-btn" [class.active]="activeTab === 'data-foundation'" (click)="switchTab('data-foundation')">Data Foundation</button>
      <button class="tab-btn" [class.active]="activeTab === 'architecture'" (click)="switchTab('architecture')">Architecture</button>
      <button class="tab-btn" [class.active]="activeTab === 'silence-danger'" (click)="switchTab('silence-danger')">Silence = Danger</button>
      <button class="tab-btn" [class.active]="activeTab === 'site-risk'" (click)="switchTab('site-risk')">Site Risk Board</button>
      <button class="tab-btn" [class.active]="activeTab === 'risk-themes'" (click)="switchTab('risk-themes')">Risk Themes</button>
      <button class="tab-btn" [class.active]="activeTab === 'model'" (click)="switchTab('model')">Site Risk Model</button>
      <button class="tab-btn" [class.active]="activeTab === 'features'" (click)="switchTab('features')">Features</button>
      <button class="tab-btn" [class.active]="activeTab === 'actions'" (click)="switchTab('actions')">Actions & Value</button>
      <button class="tab-btn" [class.active]="activeTab === 'predictions'" (click)="switchTab('predictions')">⚡ Live Predictions</button>
    </div>

    <router-outlet></router-outlet>

    <div class="footer">
      Generated April 2026 | exponentia.ai &times; GE Vernova EHS Platform | Data: 2020&ndash;2025
    </div>
  `
})
export class AppComponent implements OnInit {
  activeTab = 'exec-summary';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const urlParts = event.urlAfterRedirects.split('/');
      const tab = urlParts[urlParts.length - 1] || 'exec-summary';
      this.activeTab = tab;
    });

    this.router.navigate(['/exec-summary']);
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate(['/' + tab]);
  }
}