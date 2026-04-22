import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-data-foundation',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>Data Foundation</h2>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          Comprehensive EHS data ingested from 5 years of contractor activity across GE Vernova's global operations.
        </p>

        <h3>Source Data</h3>
        <table>
          <thead>
            <tr><th>Source</th><th>Records</th><th>Date Range</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>CW Incidents</strong></td><td><strong>6,148</strong></td><td>2020–2025</td><td>Contractor incidents with severity classification, risk themes extracted by LLM</td></tr>
            <tr><td><strong>Concern/Stopwork</strong></td><td><strong>1,035,474</strong></td><td>2020–2025</td><td>Concern and stopwork records with LLM-matched risk themes (55,216 flagged)</td></tr>
            <tr><td><strong>Site Master</strong></td><td><strong>384 sites</strong></td><td>—</td><td>Canonical site mapping: 200 with incidents, 370 with concerns, 187 with both</td></tr>
          </tbody>
        </table>

        <h3>Concern Volume by Year</h3>
        <div class="chart-container">
          <canvas baseChart [data]="chartData" [options]="chartOptions" type="bar"></canvas>
        </div>

        <h3>Data Quality</h3>
        <div style="background:#e8f5e9;border-left:4px solid #2e7d32;border-radius:0 8px 8px 0;padding:16px;margin:12px 0">
          <strong style="color:#1b5e20">Full traceability across the pipeline:</strong>
          <div style="font-size:13px;color:#2e7d32;margin-top:8px">
            6,148 incident records maintained through every processing stage with zero row loss.
            384 canonical sites consolidated from multiple source systems with standardized naming across incident and concern reporting.
            100% site mapping coverage — no single site accounts for more than 7.7% of records.
          </div>
        </div>
      </div>
    </div>
  `
})
export class DataFoundationComponent {
  chartData: ChartData<'bar'> = {
    labels: ['2021', '2022', '2023', '2024', '2025'],
    datasets: [{
      label: 'Concern/Stopwork Records',
      data: [14815, 239981, 270358, 243652, 266668],
      backgroundColor: '#2d5f8a',
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { size: 12 }, color: '#555', usePointStyle: true } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12 }
    },
    scales: {
      x: { ticks: { color: '#666', font: { size: 11 } }, grid: { color: '#e8ecf1' } },
      y: {
        ticks: { color: '#666', font: { size: 11 }, callback: (v) => (Number(v) / 1000).toFixed(0) + 'k' },
        grid: { color: '#e8ecf1' },
        beginAtZero: true
      }
    }
  };
}