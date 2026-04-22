import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-site-risk-model',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>Site Risk Prediction Model</h2>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          This model scores every site monthly using <strong>only concern-derived features</strong> — no incident data required at prediction time.
          It answers one question: <em>which sites are most likely to have a serious incident in the next 90 days?</em>
          Every score comes with plain-English explanations so EHS leaders know exactly <strong>why</strong> a site is flagged.
        </p>

        <h3>Model Summary</h3>
        <div class="grid-2">
          <div style="background:#f8fafc;border-radius:8px;padding:16px;border-left:4px solid #2d5f8a">
            <strong style="color:#1B3A5C">Algorithm</strong>
            <div style="font-size:13px;color:#555;margin-top:8px">
              <strong>LightGBM</strong> (gradient boosted trees)<br/>
              24 concern-derived features, temporal train/test split<br/>
              Training: site&times;month grid across 2020–2025<br/>
              Registered in MLflow on Databricks
            </div>
          </div>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;border-left:4px solid #2d5f8a">
            <strong style="color:#1B3A5C">What Makes It Different</strong>
            <div style="font-size:13px;color:#555;margin-top:8px">
              <strong>100% leading indicators</strong> — no lagging data needed<br/>
              Predicts <strong>before</strong> incidents happen, not after<br/>
              SHAP explanations — no black box<br/>
              Runs on uploaded concern data in real time
            </div>
          </div>
        </div>

        <h3>Risk Tier Assignment</h3>
        <div class="chart-container">
          <canvas baseChart [data]="tierChartData" [options]="tierChartOptions" type="bar"></canvas>
        </div>

        <table>
          <thead><tr><th>Risk Tier</th><th>Score Threshold</th><th>What It Means</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td><span class="tier-badge tier-HIGH">HIGH</span></td><td>&ge; 15%</td><td>Site shows multiple danger signals — silence, blind spots, declining activity</td><td><strong>Immediate safety leadership review + site audit</strong></td></tr>
            <tr><td><span class="tier-badge tier-ELEVATED">ELEVATED</span></td><td>8% – 15%</td><td>Some concern gaps or declining trends detected</td><td>Scheduled review within 2 weeks</td></tr>
            <tr><td><span class="tier-badge tier-MODERATE">MODERATE</span></td><td>5% – 8%</td><td>Minor gaps in theme coverage or low activity</td><td>Monitor and encourage concern filing</td></tr>
            <tr><td><span class="tier-badge tier-LOW">LOW</span></td><td>&lt; 5%</td><td>Active reporting, broad theme coverage, stop-work culture</td><td>Continue current practices</td></tr>
          </tbody>
        </table>

        <div class="evidence">
          <div class="title">Why This Works</div>
          <div class="detail">
            The model learned from 5 years of data that <strong>concern activity patterns precede serious incidents</strong>.
            Sites that go silent, lose theme coverage, or stop filing stop-work reports are significantly more likely to have a serious
            event in the following 90 days. This is a genuine early warning system — not a reactive triage tool.
          </div>
        </div>

        <h3>Key Input Features (24 Concern-Derived Signals)</h3>
        <div class="chart-container">
          <canvas baseChart [data]="featureChartData" [options]="featureChartOptions" type="bar"></canvas>
        </div>

        <div class="biz-explain">
          <strong>All features come from concern data:</strong> concern volume (30/60/90/180-day windows), themed concern counts,
          stop-work frequency, days since last concern (silence detection), theme coverage percentage, blind spot count,
          month-over-month trends, rolling averages, and interaction features (e.g., blind spots &times; low volume).
          No incident severity data is used at prediction time — the model runs purely on leading indicators.
        </div>
      </div>
    </div>
  `
})
export class SiteRiskModelComponent {
  tierChartData: ChartData<'bar'> = {
    labels: ['HIGH (≥15%)', 'ELEVATED (8-15%)', 'MODERATE (5-8%)', 'LOW (<5%)'],
    datasets: [{
      label: 'Score Threshold (%)',
      data: [15, 8, 5, 2],
      backgroundColor: ['#c62828', '#ef6c00', '#f9a825', '#2e7d32'],
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  tierChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        callbacks: { label: (ctx) => `Risk score threshold: ${ctx.raw}%` }
      }
    },
    scales: {
      x: { ticks: { color: '#666', font: { size: 11 } }, grid: { color: '#e8ecf1' } },
      y: {
        ticks: { color: '#666', font: { size: 11 }, callback: (v) => v + '%' },
        grid: { color: '#e8ecf1' },
        beginAtZero: true,
        max: 20
      }
    }
  };

  featureChartData: ChartData<'bar'> = {
    labels: [
      'site_severity_rate', 'has_risk_theme_match', 'seasonal_sin', 'seasonal_cos',
      'is_risk_theme_blind_spot', 'loc_total_concerns_90d', 'trailing_12m_org_incidents',
      'incident_dow', 'incident_doy', 'site_concern_total', 'blind_spot_x_concern_vol',
      'site_stopwork_rate', 'stopwork_x_org_risk', 'site_contractor_rate', 'site_incident_volume'
    ],
    datasets: [{
      label: 'Split Importance',
      data: [76, 76, 64, 62, 62, 59, 41, 37, 31, 26, 25, 24, 23, 23, 20],
      backgroundColor: '#1B3A5C',
      borderRadius: 4,
      borderSkipped: false
    }]
  };

  featureChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12 }
    },
    scales: {
      x: {
        ticks: { color: '#666', font: { size: 11 } },
        grid: { color: '#e8ecf1' },
        beginAtZero: true
      },
      y: {
        ticks: { color: '#666', font: { size: 11 } },
        grid: { color: '#e8ecf1' }
      }
    }
  };
}