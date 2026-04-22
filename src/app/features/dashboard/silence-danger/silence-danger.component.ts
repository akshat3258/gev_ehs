import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-silence-danger',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>The Central Finding: Silence = Danger</h2>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          The strongest predictor of serious incidents is not what concerns say — it's whether concerns exist at all.
          Sites with active concern reporting have dramatically lower serious rates.
        </p>

        <h3>Concern Reporting vs Serious Rate</h3>
        <div class="chart-container">
          <canvas baseChart [data]="chartData" [options]="chartOptions" type="bar"></canvas>
        </div>

        <h3>The Evidence: Paired Comparisons</h3>
        <p style="font-size:13px;color:#555;margin:12px 0">
          Same type of work, similar geographies — but vastly different concern activity and outcomes.
        </p>

        <div class="grid-2">
          <div class="site-card blind-spot">
            <div class="name">ONW LATAM Projects</div>
            <div class="narrative">
              <span class="danger">8.6% serious rate</span> with only <strong>0.3 concerns per incident</strong>.
              256 incidents, 22 serious — virtually no early warning system.
            </div>
          </div>
          <div class="site-card well-monitored">
            <div class="name">ONW LATAM Services</div>
            <div class="narrative">
              <span class="good">7.5% serious rate</span> with <strong>179.2 concerns per incident</strong>.
              Same geography, active safety culture. Concern system is working.
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="site-card blind-spot">
            <div class="name">CS - ACS INDIA</div>
            <div class="narrative">
              <span class="danger">63.6% serious rate</span> with only <strong>0.5 concerns per incident</strong>.
              7 out of 11 incidents were serious. Zero themed concerns. Complete blind spot.
            </div>
          </div>
          <div class="site-card well-monitored">
            <div class="name">GP Projects - Europe</div>
            <div class="narrative">
              <span class="good">7.0% serious rate</span> with <strong>259.6 concerns per incident</strong>.
              8,293 themed concerns. Extensive monitoring, low severity.
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="site-card blind-spot">
            <div class="name">Hybrids - Projects and Services</div>
            <div class="narrative">
              <span class="danger">25.0% serious rate</span> with only <strong>0.2 concerns per incident</strong>.
              3 of 12 incidents serious. Only 2 concerns total filed. Zero themed.
            </div>
          </div>
          <div class="site-card well-monitored">
            <div class="name">GP Projects - Asia</div>
            <div class="narrative">
              <span class="good">7.8% serious rate</span> with <strong>123.7 concerns per incident</strong>.
              6,612 themed concerns. Heavily monitored, controlled outcomes.
            </div>
          </div>
        </div>

        <div class="danger-box">
          <div class="title">The Pattern Is Clear</div>
          <div class="detail">
            Sites with fewer than 1 concern per incident average <strong>25-64% serious rates</strong>.
            Sites with over 30 concerns per incident stay below <strong>15%</strong>.
            The concern/stopwork system is demonstrably protective — but only when it's active.
          </div>
        </div>
      </div>
    </div>
  `
})
export class SilenceDangerComponent {
  chartData: ChartData<'bar'> = {
    labels: [
      'CS-ACS INDIA\n(0.5 c/i)',
      'Hybrids\n(0.2 c/i)',
      'PJ-MENAT Turkey\n(0.6 c/i)',
      'ONW LATAM Proj\n(0.3 c/i)',
      'GSI LAM\n(31 c/i)',
      'ONW NAM MCE\n(8.8 c/i)',
      'ONW NAM Svc\n(31 c/i)',
      'GP Asia\n(124 c/i)',
      'GP Europe\n(260 c/i)',
      'ONW LATAM Svc\n(179 c/i)'
    ],
    datasets: [{
      label: 'Serious Rate (%)',
      data: [63.6, 25.0, 25.0, 8.6, 14.8, 11.1, 6.8, 7.8, 7.0, 7.5],
      backgroundColor: ['#c62828', '#c62828', '#c62828', '#ef6c00', '#ef6c00', '#f9a825', '#2e7d32', '#2e7d32', '#2e7d32', '#2e7d32'],
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12 }
    },
    scales: {
      x: {
        ticks: { color: '#666', font: { size: 10 }, maxRotation: 45 },
        grid: { color: '#e8ecf1' }
      },
      y: {
        ticks: { color: '#666', font: { size: 11 }, callback: (v) => v + '%' },
        grid: { color: '#e8ecf1' },
        beginAtZero: true,
        max: 70
      }
    }
  };
}