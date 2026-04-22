import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-executive-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>Executive Summary</h2>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          Over 6 years (2020–2025), we analyzed <strong>6,148 contractor incidents</strong> and <strong>1,035,474 concern/stopwork records</strong>
          across <strong>384 GE Vernova sites</strong>. The platform delivers a <strong>site risk prediction system</strong> based on
          concern activity that identifies at-risk sites <em>before</em> serious incidents occur — using only leading indicators.
        </p>

        <h3>Platform at a Glance</h3>
        <div class="metrics-row">
          <div class="metric-card">
            <div class="value">6,148</div>
            <div class="label">Contractor Incidents (2020–2025)</div>
          </div>
          <div class="metric-card">
            <div class="value">1.04M</div>
            <div class="label">Concern/Stopwork Records</div>
          </div>
          <div class="metric-card alert">
            <div class="value">418</div>
            <div class="label">Serious Events (6.8%)</div>
          </div>
          <div class="metric-card">
            <div class="value">384</div>
            <div class="label">Canonical Sites Mapped</div>
          </div>
          <div class="metric-card success">
            <div class="value">100%</div>
            <div class="label">Site Mapping Coverage</div>
          </div>
          <div class="metric-card">
            <div class="value">21</div>
            <div class="label">LLM-Extracted Risk Themes</div>
          </div>
        </div>

        <h3>Three Big Findings</h3>

        <div class="danger-box">
          <div class="title">1. Silence Is the Danger Signal</div>
          <div class="detail">
            Sites with &lt;1 concern per incident have serious rates up to <strong>63.6%</strong>.
            Sites with &gt;100 concerns per incident stay below <strong>8%</strong>.
            The absence of concern reporting — not the presence of incidents — is the strongest predictor of fatality risk.
          </div>
        </div>

        <div class="evidence">
          <div class="title">2. All 21 Risk Themes Are Protective When Reported</div>
          <div class="detail">
            AI extracted 21 hazard categories from serious incidents and mapped them to 1M+ concerns.
            Every single theme shows <strong>lower</strong> severity when concerns about that theme were raised in the prior 90 days.
            Reporting these hazards cuts the serious rate by <strong>24% to 68%</strong>.
          </div>
        </div>

        <div class="evidence">
          <div class="title">3. Site Risk Prediction — Before Incidents Happen</div>
          <div class="detail">
            The model scores every site monthly using <strong>only concern-derived features</strong> — volume, theme coverage, blind spots,
            silence periods, and stop-work rates. Sites flagged as HIGH risk get plain-English explanations:
            <em>"No concerns filed in 45 days," "Only 3 of 21 themes covered."</em> No lagging indicators required.
          </div>
        </div>

      </div>
    </div>
  `
})
export class ExecutiveSummaryComponent {}