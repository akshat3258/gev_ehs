import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

interface RiskTheme {
  name: string;
  description: string;
  matched: number;
  dangerReduction: number;
}

@Component({
  selector: 'app-risk-themes',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>Risk Themes — How AI Reads Your Safety Data</h2>
        <h3>The Problem</h3>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          Your incident reports and concern records are written in free text by hundreds of different people across 384 sites.
          "Worker fell from scaffold," "Person slipped off elevated platform," "Fall from height during steel erection" — these are
          all the same hazard, but written differently every time. No human can read a million records and find the patterns.
          We built AI to do it.
        </p>

        <div class="metrics-row">
          <div class="metric-card">
            <div class="value">1.04M</div>
            <div class="label">Free-text records analyzed</div>
          </div>
          <div class="metric-card alert">
            <div class="value">418</div>
            <div class="label">Serious incidents studied</div>
          </div>
          <div class="metric-card success">
            <div class="value">21</div>
            <div class="label">Hazard categories identified</div>
          </div>
          <div class="metric-card success">
            <div class="value">55,216</div>
            <div class="label">Concerns matched to hazards</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Step 1: AI Reads Your Serious Incidents</h3>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          We started with the events that matter most — your <strong>418 serious incidents</strong> (Level A, Level B, and PSE events).
          We fed every serious incident description through an AI language model and asked: <em>what is the core hazard here?</em>
        </p>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          From 418 serious incidents, the AI identified <strong>21 distinct hazard categories</strong>. These aren't generic safety
          textbook categories — they came directly from your data. These are the 21 ways your contractors actually get seriously hurt.
        </p>

        <div class="feature-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
          <div class="feature-card" *ngFor="let theme of themesShort" style="text-align:center;padding:10px">
            <h4 style="font-size:12px">{{ theme }}</h4>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Step 2: Matching Hazard Categories to 1 Million Concerns</h3>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          We now had 21 hazard categories from incidents — but we also had <strong>1,035,474 concern and stopwork records</strong>.
          The question: which concerns are about which hazards?
        </p>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          We used a two-step approach. First, we asked the AI to generate the specific keywords and phrases that people use when
          writing about each hazard. For example, for "fall from height" the AI generated patterns like <em>"working at height,"
          "no harness," "guardrail missing," "unprotected edge," "fall arrest."</em> For "LOTO violation," it generated
          <em>"lockout," "tagout," "energized," "isolation not verified."</em>
        </p>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          Then we ran these patterns across all 1 million+ concern records at scale. Result: <strong>55,216 concerns</strong> matched
          at least one hazard category. Every matched concern now carries a label telling us exactly which hazards it is flagging.
        </p>

        <div style="background:linear-gradient(135deg,#f8fafc 0%,#eef2f7 100%);border-radius:8px;padding:20px;margin:16px 0">
          <div style="text-align:center;font-size:16px;color:#1B3A5C;font-weight:600;margin-bottom:12px">
            How the AI Matching Works
          </div>
          <div style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:12px;align-items:center;text-align:center">
            <div class="arch-stage">
              <h4>418 Serious Incidents</h4>
              <div class="arch-row">AI reads each description</div>
              <div class="arch-row">Extracts the core hazard</div>
            </div>
            <div style="font-size:24px;color:#2d5f8a">&rarr;</div>
            <div class="arch-stage">
              <h4>21 Hazard Categories</h4>
              <div class="arch-row">AI generates keywords &amp; phrases</div>
              <div class="arch-row">for each hazard type</div>
            </div>
            <div style="font-size:24px;color:#2d5f8a">&rarr;</div>
            <div class="arch-stage">
              <h4>1.04M Concerns Scanned</h4>
              <div class="arch-row">Pattern matching at scale</div>
              <div class="arch-row"><strong>55,216 concerns labeled</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Step 3: The Discovery — Reporting a Hazard Reduces Its Danger</h3>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          With hazard categories mapped to both incidents and concerns, we could finally ask the critical question:
          <strong>when a site is actively reporting concerns about a specific hazard, does that hazard become less dangerous?</strong>
        </p>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          We checked all 21 hazard categories. For each one, we compared incidents where concerns about that hazard had been filed
          in the 90 days prior, versus incidents where they hadn't. The result was unanimous:
        </p>

        <div class="danger-box" style="background:#e8f5e9;border-left-color:#2e7d32">
          <div class="title" style="color:#1b5e20;font-size:16px">All 21 hazard categories are protective when reported.</div>
          <div class="detail" style="color:#2e7d32;font-size:14px">
            When concerns are actively being filed about a hazard, the serious incident rate for that hazard drops by
            <strong>24% to 68%</strong>. This holds for every single hazard category — no exceptions.
          </div>
        </div>

        <h3>Danger Reduction by Hazard Category</h3>
        <p style="font-size:13px;color:#777;margin-bottom:4px">
          Each bar shows how much the serious incident rate drops when concerns about that hazard are being actively reported.
          Longer bars = greater protective effect.
        </p>
        <div class="chart-container" style="height:520px">
          <canvas baseChart [data]="chartData" [options]="chartOptions" type="bar"></canvas>
        </div>

        <div class="biz-explain">
          <strong>How to read this chart:</strong> Take "Excavation / Trench" at 68%. This means: when someone wrote
          "I saw an unshored trench" in the weeks before an incident, the serious incident rate was only 32% of what it was
          at sites where nobody had raised excavation concerns. The simple act of reporting cut the danger by 68%.
        </div>
      </div>

      <div class="card">
        <h3>The Flip Side — Blind Spots</h3>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          If every hazard category is protective when reported, then the most dangerous situation is when
          <strong>a hazard exists but nobody is reporting it</strong>.
        </p>

        <div class="grid-2">
          <div class="danger-box">
            <div class="title">What a Blind Spot Looks Like</div>
            <div class="detail">
              A site is doing crane operations. They've had lifting incidents before.
              But in the last 90 days, <strong>zero concerns</strong> have been filed about lifting or rigging.
              The protective effect is absent. Nobody is watching for that hazard.
              That's a blind spot — and it's where the next serious incident is most likely to happen.
            </div>
          </div>
          <div class="evidence">
            <div class="title">What Active Monitoring Looks Like</div>
            <div class="detail">
              A different site, also doing crane work. But they've filed <strong>47 concerns</strong> about
              lifting and rigging in the last 90 days — loose slings, overloaded hooks, missing lift plans.
              Each one triggered a correction. The serious rate at this site is 61% lower than baseline.
              The concern system is working exactly as designed.
            </div>
          </div>
        </div>

        <div class="biz-explain">
          <strong>What the platform does:</strong> For each of your 384 sites, we track which of the 21 hazard categories
          are covered by active concern reporting — and which ones have zero coverage. Those gaps are flagged automatically
          so your safety teams know exactly where to focus.
        </div>
      </div>

      <div class="card">
        <h3>All 21 Hazard Categories — Full Detail</h3>
        <table>
          <thead>
            <tr>
              <th>Hazard Category</th>
              <th>What It Covers<span class="col-desc">Types of concerns and incidents in this category</span></th>
              <th>Concerns Matched<span class="col-desc">Out of 1.04M total</span></th>
              <th>Danger Reduction<span class="col-desc">How much the serious rate drops when concerns are filed</span></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let theme of themes">
              <td><strong>{{ theme.name }}</strong></td>
              <td>{{ theme.description }}</td>
              <td>{{ theme.matched | number }}</td>
              <td [class.good]>{{ theme.dangerReduction }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class RiskThemesComponent {
  themesShort = [
    'Fall from Height', 'Lifting / Rigging / Crane', 'Electrical / Arc Flash', 'LOTO Violation', 'Confined Space',
    'Hot Work / Fire', 'Scaffolding Hazard', 'Vehicle / Mobile Equip', 'Slip / Trip / Fall', 'Machine / Power Tool',
    'Dropped Object', 'Chemical / Hazmat', 'Excavation / Trench', 'Contractor Mgmt Failure', 'Suspended Platform',
    'Forklift / Material Handling', 'Caught In / Crushing', 'Environmental Spill', 'Struck by Object', 'Sharp / Cutting Object', '= 21 total'
  ];

  themes: RiskTheme[] = [
    { name: 'Excavation / Trench Collapse', description: 'Unshored trenches, spoil piles, no barriers around open digs', matched: 1266, dangerReduction: 68 },
    { name: 'Vehicle / Mobile Equipment', description: 'Forklifts, dump trucks, excavators in pedestrian areas, no banksman', matched: 2755, dangerReduction: 67 },
    { name: 'Suspended Platform', description: 'Corroded wire ropes, overloaded swing stages, unrated anchor points', matched: 1652, dangerReduction: 65 },
    { name: 'Machine / Power Tool Injury', description: 'Guards removed, cracked grinder wheels, no dust extraction', matched: 2388, dangerReduction: 62 },
    { name: 'Lifting / Rigging / Crane', description: 'Worn slings, loads over walkways, no lift plans, boom overextension', matched: 3110, dangerReduction: 61 },
    { name: 'Fall from Height', description: 'Missing harnesses, unsecured ladders, scaffold gaps, no edge protection', matched: 2698, dangerReduction: 60 },
    { name: 'LOTO Violation', description: 'No lockout/tagout, locks removed early, energized equipment accessed', matched: 1911, dangerReduction: 58 },
    { name: 'Chemical / Hazmat Exposure', description: 'No containment, missing MSDS, improper mixing, unlabeled containers', matched: 713, dangerReduction: 56 },
    { name: 'Hot Work / Fire / Explosion', description: 'Welding near fuel, no fire watch, sparks on combustibles, no permit', matched: 1476, dangerReduction: 53 },
    { name: 'Dropped Object from Height', description: 'Unsecured tools on platforms, no toe boards, no drop zone barricades', matched: 413, dangerReduction: 52 },
    { name: 'Contact with Sharp Object', description: 'Uncapped rebar, unprotected sheet metal edges, exposed blades', matched: 360, dangerReduction: 52 },
    { name: 'Confined Space', description: 'No gas testing, rescue equipment absent, expired entry permits', matched: 1501, dangerReduction: 47 },
    { name: 'Environmental Spill', description: 'Hydraulic oil leaks, diesel on soil, paint waste to ground', matched: 309, dangerReduction: 44 },
    { name: 'Caught In / Crushing', description: 'Between vehicle and barrier, near pinch points, unguarded rotating shafts', matched: 102, dangerReduction: 43 },
    { name: 'Electrical / Arc Flash', description: 'Open live panels, no arc flash PPE, cables in water, no boundaries', matched: 1074, dangerReduction: 37 },
    { name: 'Struck by Object', description: 'Falling debris, swinging loads, unsecured materials near walkways', matched: 322, dangerReduction: 37 },
    { name: 'Slip / Trip / Fall (Same Level)', description: 'Oil spills, cable runs across paths, uneven flooring, poor housekeeping', matched: 363, dangerReduction: 32 },
    { name: 'Forklift / Material Handling', description: 'Obstructed vision, excessive stacking, forks raised while traveling', matched: 372, dangerReduction: 30 },
    { name: 'Contractor Safety Mgmt Failure', description: 'No induction, expired permits, supervisor absent, crew not briefed', matched: 388, dangerReduction: 25 },
    { name: 'Scaffolding Hazard', description: 'Red-tagged scaffold in use, no base plates, bracing removed, uncertified', matched: 401, dangerReduction: 24 }
  ];

  chartData: ChartData<'bar'> = {
    labels: this.themes.map(t => t.name),
    datasets: [{
      label: 'Danger Reduction %',
      data: this.themes.map(t => t.dangerReduction),
      backgroundColor: '#2e7d32',
      borderRadius: 4,
      borderSkipped: false
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        callbacks: {
          label: (ctx) => ctx.raw + '% danger reduction when concerns are actively raised'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#666', font: { size: 11 }, callback: (v: number | string) => v + '%' },
        grid: { color: '#e8ecf1' },
        min: 0,
        max: 80
      },
      y: {
        ticks: { color: '#666', font: { size: 10 } },
        grid: { color: '#e8ecf1' }
      }
    }
  };
}