import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actions-value',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>Recommended Actions &amp; Business Value</h2>

        <h3>Immediate Actions (This Quarter)</h3>

        <div class="danger-box">
          <div class="title">Action 1: Investigate Silent Sites</div>
          <div class="detail">
            Four sites have serious rates above 25% with fewer than 1 concern per incident:
            CS - ACS INDIA (63.6%), PJ-MENAT YandK Project Turkey (25.0%), Hybrids - Projects and Services (25.0%), OFW Services (25.6%).
            <strong>These sites need immediate safety culture audits.</strong> The concern system is not functioning there.
          </div>
        </div>

        <div class="evidence">
          <div class="title">Action 2: Activate Risk Theme Monitoring</div>
          <div class="detail">
            Deploy the 21 LLM-extracted risk themes as automated concern classifiers.
            When a site shows incident activity in a theme but zero themed concerns (e.g., lifting incidents at a site with no lifting concerns),
            auto-generate alerts. This closes the blind spot gap proactively.
          </div>
          <div class="action">
            <strong>Expected Impact:</strong> Based on the protective lift data, activating theme monitoring at silent sites could reduce their serious rates by 30-60%.
          </div>
        </div>

        <div class="evidence">
          <div class="title">Action 3: Deploy Site Risk Prediction</div>
          <div class="detail">
            Each month, the site risk model scores every site based on its recent concern activity — volume, theme coverage, trends, and blind spots.
            Sites flagged as HIGH risk should trigger immediate safety leadership review and targeted site audits.
            The model uses only leading indicators (concern patterns), so it flags danger <em>before</em> serious incidents happen.
          </div>
          <div class="action">
            <strong>Expected Impact:</strong> Proactive intervention at high-risk sites before incidents occur, shifting EHS from reactive investigation to preventive action.
          </div>
        </div>

        <h3>Medium-Term Initiatives</h3>

        <div class="evidence">
          <div class="title">Action 4: Concern Quality Program</div>
          <div class="detail">
            The data proves that concern activity is protective. Launch a program to increase concern filing at low-activity sites,
            with specific focus on the 21 risk themes. Provide field teams with theme-specific templates and checklists.
            Measure success by concerns-per-incident ratio.
          </div>
        </div>

        <div class="evidence">
          <div class="title">Action 5: Continuous Model Retraining</div>
          <div class="detail">
            As new concern and incident data flows in each month, the site risk model and theme classifier retrain automatically via Databricks jobs.
            Model performance is tracked in MLflow. Over time, the system learns which concern patterns are most predictive for each site type.
          </div>
        </div>

        <h3>Business Case Summary</h3>
        <div class="case-summary">
          <strong>Platform Delivers Three Capabilities:</strong>
          <ul>
            <li><strong>Site Risk Prediction (Leading Indicator):</strong> Scores every site monthly based on concern activity — volume, theme coverage, trends, and silence periods. Flags sites heading for trouble <em>before</em> serious incidents happen.</li>
            <li><strong>Theme-Based Gap Analysis:</strong> 21 AI-extracted risk themes identify which hazards each site is watching for — and which ones nobody is reporting. Every theme is protective when actively monitored (24–68% danger reduction).</li>
            <li><strong>Plain-English Explanations:</strong> Every high-risk site comes with clear reasons — "No concerns filed in 45 days," "Only 3 of 21 themes covered," "Concern volume dropped 60% from last month" — so EHS leaders know exactly where to act.</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class ActionsValueComponent {}