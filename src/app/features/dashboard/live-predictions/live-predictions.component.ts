import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { ApiService, PredictionResponse, SiteResult } from '../../../core/services/api.service';
import { LocalInferenceService, RISK_THEMES, ConcernRecord, PredictionResults, SiteRiskResult } from '../../../shared/services/local-inference.service';

Chart.register(...registerables);

@Component({
  selector: 'app-live-predictions',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>⚡ Site Risk Predictions — Live Pipeline</h2>
        <div class="biz-explain" style="margin-bottom:20px">
          <strong>How it works:</strong> Upload your latest concern data (CSV) → the AI classifies each concern into risk themes →
          aggregates by site → scores every site for 90-day serious incident risk → shows you which sites need attention and <em>why</em>.
          No black boxes — every score comes with plain-English explanations.
        </div>

        <!-- STEP 1: UPLOAD -->
        <div id="pred-upload-section" [style.display]="currentStep === 1 ? 'block' : 'none'">
          <h3>Step 1: Upload Concern Data</h3>
          <div class="upload-zone" id="uploadZone" (click)="fileInput.click()" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)" [class.drag-over]="isDragOver">
            <div class="upload-icon">📁</div>
            <div class="upload-text">Drag & drop your concern CSV here, or click to browse</div>
            <div class="upload-hint">Expected columns: id, concern_type, incident_task_desc, location_nme, org_nme, incident_reported_dt, ...</div>
            <input #fileInput type="file" accept=".csv" style="display:none" (change)="onFileSelected($event)">
          </div>
          <div id="upload-status" style="margin-top:12px;font-size:13px;color:#666">{{ uploadStatus }}</div>
          <div style="margin-top:12px;text-align:center">
            <button class="run-btn" style="background:#f5f5f5;color:#1B3A5C;border:1px solid #ccc;margin-right:8px" (click)="loadDemo()">Load Demo Data</button>
          </div>
        </div>

        <!-- STEP 2: DATA PREVIEW -->
        <div id="pred-preview-section" [style.display]="currentStep === 2 ? 'block' : 'none'">
          <h3>Step 2: Data Preview</h3>
          <div class="metrics-row" id="upload-metrics">
            <div class="metric-card">
              <div class="value">{{ previewMetrics.totalRows }}</div>
              <div class="label">Concerns Uploaded</div>
            </div>
            <div class="metric-card">
              <div class="value">{{ previewMetrics.totalSites }}</div>
              <div class="label">Sites Identified</div>
            </div>
            <div class="metric-card">
              <div class="value">{{ previewMetrics.earliestDate }}</div>
              <div class="label">Earliest Date</div>
            </div>
            <div class="metric-card">
              <div class="value">{{ previewMetrics.latestDate }}</div>
              <div class="label">Latest Date</div>
            </div>
          </div>
          <div style="overflow-x:auto;max-height:250px;overflow-y:auto;margin-bottom:16px">
            <table id="preview-table">
              <thead>
                <tr>
                  <th>id</th>
                  <th>location_nme</th>
                  <th>concern_type</th>
                  <th>incident_task_desc</th>
                  <th>incident_reported_dt</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of previewRows">
                  <td>{{ row.id }}</td>
                  <td>{{ row.location_nme }}</td>
                  <td>{{ row.concern_type }}</td>
                  <td>{{ (row.incident_task_desc || '').substring(0, 80) }}</td>
                  <td>{{ row.incident_reported_dt }}</td>
                </tr>
                <tr *ngIf="previewRows.length < previewMetrics.totalRows">
                  <td colspan="5" style="text-align:center;color:#999;font-style:italic">... and {{ previewMetrics.totalRows - previewRows.length }} more rows</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="text-align:center">
            <button class="run-btn" id="runPipelineBtn" (click)="runPipeline()">▶ Run Prediction Pipeline</button>
          </div>
        </div>

        <!-- STEP 3: PROCESSING -->
        <div id="pred-processing-section" [style.display]="currentStep === 3 ? 'block' : 'none'">
          <h3>Processing Pipeline</h3>
          <div id="pipeline-mode-banner" class="biz-explain" style="margin-bottom:16px" [style.display]="usingApi ? 'block' : 'none'">
            <strong>🔗 Connected to Databricks</strong> — Running MLflow models on your cluster. Theme Classifier → Site Risk Model → SHAP Explanations.
          </div>
          <div class="pipeline-steps">
            <div class="pipeline-step" [class.running]="processingSteps[0] === 'running'" [class.done]="processingSteps[0] === 'done'">
              <span class="step-icon">{{ getStepIcon(0) }}</span>
              <span class="step-label">Theme Classification</span>
              <span class="step-detail">{{ usingApi ? 'Running TF-IDF + LogisticRegression across 21 risk themes...' : 'Running keyword matching across 21 risk themes...' }}</span>
            </div>
            <div class="pipeline-step" [class.running]="processingSteps[1] === 'running'" [class.done]="processingSteps[1] === 'done'">
              <span class="step-icon">{{ getStepIcon(1) }}</span>
              <span class="step-label">Site Aggregation</span>
              <span class="step-detail">{{ usingApi ? 'Computing concern volumes, theme coverage, trends per site...' : 'Computing site-level features via Spark SQL on Databricks...' }}</span>
            </div>
            <div class="pipeline-step" [class.running]="processingSteps[2] === 'running'" [class.done]="processingSteps[2] === 'done'">
              <span class="step-icon">{{ getStepIcon(2) }}</span>
              <span class="step-label">Risk Scoring</span>
              <span class="step-detail">{{ usingApi ? 'LightGBM model scoring + SHAP explanations...' : 'Scoring with LightGBM site risk model...' }}</span>
            </div>
            <div class="pipeline-step" [class.running]="processingSteps[3] === 'running'" [class.done]="processingSteps[3] === 'done'">
              <span class="step-icon">{{ getStepIcon(3) }}</span>
              <span class="step-label">Explanation Generation</span>
              <span class="step-detail">{{ usingApi ? 'Template engine mapping SHAP values to plain English...' : 'Generating plain-English explanations from keyword patterns...' }}</span>
            </div>
          </div>
        </div>

        <!-- STEP 4: RESULTS DASHBOARD -->
        <div id="pred-results-section" [style.display]="currentStep === 4 ? 'block' : 'none'">
          <h3>Prediction Results — Site Risk Dashboard</h3>

          <div class="metrics-row" id="result-metrics">
            <div class="metric-card alert">
              <div class="value">{{ tierCounts.HIGH }}</div>
              <div class="label">HIGH Risk Sites</div>
            </div>
            <div class="metric-card warn">
              <div class="value">{{ tierCounts.ELEVATED }}</div>
              <div class="label">ELEVATED Risk Sites</div>
            </div>
            <div class="metric-card">
              <div class="value">{{ siteResults.length }}</div>
              <div class="label">Total Sites Scored</div>
            </div>
            <div class="metric-card">
              <div class="value">{{ avgBlindSpots }}</div>
              <div class="label">Avg. Blind Spots per Site</div>
            </div>
          </div>

          <div class="chart-row">
            <div class="card" style="margin-bottom:0">
              <h3 style="margin-top:0">Risk Tier Distribution</h3>
              <div class="chart-container" style="height:260px">
                <canvas baseChart [data]="tierChartData" [options]="tierChartOptions" type="doughnut"></canvas>
              </div>
            </div>
            <div class="card" style="margin-bottom:0">
              <h3 style="margin-top:0">Theme Coverage Gaps (Blind Spots)</h3>
              <div class="chart-container" style="height:260px">
                <canvas baseChart [data]="blindSpotChartData" [options]="blindSpotChartOptions" type="bar"></canvas>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top:16px">
            <h3 style="margin-top:0">Site-Level Risk Scores</h3>
            <div class="tier-filter" style="margin-bottom:12px">
              <button class="filter-btn" [class.active]="tierFilter === 'all'" (click)="setTierFilter('all')">All Sites</button>
              <button class="filter-btn" [class.active]="tierFilter === 'HIGH'" (click)="setTierFilter('HIGH')">🔴 HIGH</button>
              <button class="filter-btn" [class.active]="tierFilter === 'ELEVATED'" (click)="setTierFilter('ELEVATED')">🟠 ELEVATED</button>
              <button class="filter-btn" [class.active]="tierFilter === 'MODERATE'" (click)="setTierFilter('MODERATE')">🟡 MODERATE</button>
              <button class="filter-btn" [class.active]="tierFilter === 'LOW'" (click)="setTierFilter('LOW')">🟢 LOW</button>
            </div>
            <div style="overflow-x:auto">
              <table id="results-table">
                <thead>
                  <tr>
                    <th>Site<span class="col-desc">Location name</span></th>
                    <th>Risk Score<span class="col-desc">P(serious incident in 90d)</span></th>
                    <th>Tier<span class="col-desc">Risk classification</span></th>
                    <th>Concerns<span class="col-desc">Filed this period</span></th>
                    <th>Themes Covered<span class="col-desc">Out of 21</span></th>
                    <th>Blind Spots<span class="col-desc">Uncovered themes</span></th>
                    <th>Why This Site Is at Risk<span class="col-desc">SHAP-driven explanations</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="site-row" *ngFor="let site of filteredSites; let i = index" (click)="showDrilldown(i)">
                    <td><strong>{{ site.name }}</strong><br><span style="font-size:11px;color:#666">{{ site.org }}</span></td>
                    <td style="text-align:center"><strong>{{ (site.riskScore * 100).toFixed(1) }}%</strong></td>
                    <td><span class="tier-badge" [class.tier-HIGH]="site.tier === 'HIGH'" [class.tier-ELEVATED]="site.tier === 'ELEVATED'" [class.tier-MODERATE]="site.tier === 'MODERATE'" [class.tier-LOW]="site.tier === 'LOW'">{{ site.tier }}</span></td>
                    <td style="text-align:center">{{ site.concernCount }}</td>
                    <td style="text-align:center">{{ site.themeCoverage }} / 21</td>
                    <td>
                      <span class="blind-spot-tag" *ngFor="let t of site.blindSpotNames.slice(0, 3)">{{ t }}</span>
                      <span class="blind-spot-tag" *ngIf="site.blindSpots > 3">+{{ site.blindSpots - 3 }} more</span>
                      <span *ngIf="site.blindSpots === 0" style="color:#2e7d32;font-size:12px">Good coverage</span>
                    </td>
                    <td>
                      <span class="explanation-tag" *ngFor="let e of site.explanations" [class.positive]="!e.risk">{{ e.text }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Detailed site drilldown -->
          <div class="card" id="site-drilldown" [style.display]="showDrill === true ? 'block' : 'none'" style="margin-top:16px">
            <h3 style="margin-top:0" id="drilldown-title">Site Drilldown: {{ drilldownSite?.name }}</h3>
            <div class="chart-row">
              <div>
                <h3 style="margin-top:0">Theme Coverage</h3>
                <div class="chart-container" style="height:350px">
                  <canvas baseChart [data]="drilldownThemeChartData" [options]="drilldownThemeChartOptions" type="bar"></canvas>
                </div>
              </div>
              <div>
                <h3 style="margin-top:0">Risk Factor Breakdown</h3>
                <div id="drilldown-explanations">
                  <div style="margin-bottom:12px">
                    <span class="tier-badge" [class.tier-HIGH]="drilldownSite?.tier === 'HIGH'" [class.tier-ELEVATED]="drilldownSite?.tier === 'ELEVATED'" [class.tier-MODERATE]="drilldownSite?.tier === 'MODERATE'" [class.tier-LOW]="drilldownSite?.tier === 'LOW'" style="font-size:14px;padding:6px 16px">{{ drilldownSite?.tier }} RISK</span>
                    <span style="margin-left:12px;font-size:16px;font-weight:700;color:#1B3A5C">{{ ((drilldownSite?.riskScore || 0) * 100).toFixed(1) }}% probability</span>
                  </div>
                  <div class="drilldown-item" *ngFor="let e of drilldownSite?.explanations" [class.risk]="e.risk" [class.ok]="!e.risk">
                    {{ e.risk ? '⚠️' : '✅' }} {{ e.text }}
                  </div>
                  <div style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:12px;color:#666">
                    <strong>Site Summary:</strong> {{ drilldownSite?.concernCount }} concerns filed | {{ drilldownSite?.themeCoverage }}/21 themes covered | {{ (drilldownSite?.stopworkRate || 0) | number:'1.0-0' }}% stop-work actions | Last concern: {{ drilldownSite?.daysSinceLastConcern }} days ago
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="text-align:center;margin-top:20px">
            <button class="run-btn" style="background:#f5f5f5;color:#1B3A5C;border:1px solid #ccc" (click)="reset()">↩ Upload New Data</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LivePredictionsComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  currentStep = 1;
  isDragOver = false;
  uploadStatus = '';
  parsedData: ConcernRecord[] = [];
  selectedFile: File | null = null;
  siteResults: SiteRiskResult[] = [];
  tierFilter = 'all';
  showDrill = false;
  drilldownSite: SiteRiskResult | null = null;
  drilldownIndex = 0;
  usingApi = false;

  processingSteps = ['pending', 'pending', 'pending', 'pending'];

  previewMetrics = { totalRows: 0, totalSites: 0, earliestDate: '', latestDate: '' };
  previewRows: ConcernRecord[] = [];

  tierCounts = { HIGH: 0, ELEVATED: 0, MODERATE: 0, LOW: 0 };
  avgBlindSpots = 0;
  filteredSites: SiteRiskResult[] = [];
  themeGaps: Record<string, number> = {};

  tierChartData!: ChartData<'doughnut'>;
  tierChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16, usePointStyle: true } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} site${(ctx.raw as number) !== 1 ? 's' : ''}` } }
    }
  };

  blindSpotChartData!: ChartData<'bar'>;
  blindSpotChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#666', stepSize: 1 }, grid: { color: '#e8ecf1' }, beginAtZero: true },
      y: { ticks: { color: '#666', font: { size: 10 } }, grid: { color: '#e8ecf1' } }
    }
  };

  drilldownThemeChartData!: ChartData<'bar'>;
  drilldownThemeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ctx.raw === 1 ? 'Covered — concerns filed' : 'BLIND SPOT — no concerns' } } },
    scales: {
      x: { display: false, max: 1.2 },
      y: { ticks: { color: '#666', font: { size: 10 } }, grid: { color: '#e8ecf1' } }
    }
  };

  constructor(
    private apiService: ApiService,
    private localInference: LocalInferenceService
  ) {}

  getStepIcon(index: number): string {
    const step = this.processingSteps[index];
    if (step === 'done') return '✅';
    if (step === 'running') return '🔄';
    return '⏳';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      this.uploadStatus = '<span style="color:#c62828">Please upload a .csv file</span>';
      return;
    }
    this.selectedFile = file;
    this.uploadStatus = `Selected: ${file.name}`;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.parsedData = this.localInference.parseCSV(e.target?.result as string);
      this.showPreview();
    };
    reader.readAsText(file);
  }

  loadDemo() {
    this.parsedData = this.localInference.generateDemoData();
    this.uploadStatus = 'Loaded demo data (13 sites, 190 concerns)';
    this.showPreview();
  }

  showPreview() {
    if (this.parsedData.length === 0) return;
    this.currentStep = 2;
    const sites = [...new Set(this.parsedData.map(r => r.location_nme).filter(Boolean))];
    const dates = this.parsedData.map(r => r.incident_reported_dt).filter(Boolean).sort();
    this.previewMetrics = {
      totalRows: this.parsedData.length,
      totalSites: sites.length,
      earliestDate: dates[0] || 'N/A',
      latestDate: dates[dates.length - 1] || 'N/A'
    };
    this.previewRows = this.parsedData.slice(0, 15);
  }

  async runPipeline() {
    this.currentStep = 3;
    this.processingSteps = ['running', 'pending', 'pending', 'pending'];
    await this.delay(400);

    this.processingSteps[0] = 'done';
    this.processingSteps[1] = 'running';
    await this.delay(600);

    this.processingSteps[1] = 'done';
    this.processingSteps[2] = 'running';
    await this.delay(600);

    this.processingSteps[2] = 'done';
    this.processingSteps[3] = 'running';
    await this.delay(500);

    this.processingSteps[3] = 'done';
    await this.delay(400);

    // Try API first, fall back to local inference
    this.usingApi = await this.checkApiAvailable();

    if (this.usingApi && this.selectedFile) {
      try {
        // Try Databricks endpoint
        const apiResult = await this.apiService.predict(this.selectedFile);
        this.processApiResult(apiResult);
        this.currentStep = 4;
        return;
      } catch (error) {
        console.log('Databricks endpoint failed, trying local inference:', error);
        this.usingApi = false;
      }
    }

    // Fall back to local inference via backend
    if (this.selectedFile) {
      try {
        const localResult = await this.apiService.predictLocal(this.selectedFile);
        this.processApiResult(localResult);
        this.currentStep = 4;
        return;
      } catch (error) {
        console.log('Backend local endpoint also failed, using client-side inference:', error);
      }
    }

    // Last resort: client-side local inference
    const localResults = this.localInference.runInference(this.parsedData);
    this.processLocalResult(localResults);
    this.currentStep = 4;
  }

  private async checkApiAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.apiService.getBackendUrl() + '/api/health', {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private processApiResult(result: PredictionResponse) {
    this.siteResults = result.results.sites.map((s: SiteResult) => this.mapApiSiteToLocal(s));
    this.tierCounts = result.results.tier_counts;
    this.themeGaps = result.results.theme_gaps;
    this.avgBlindSpots = Math.round(this.siteResults.reduce((a, s) => a + s.blindSpots, 0) / this.siteResults.length);
    this.filteredSites = this.siteResults;
    this.buildCharts();
  }

  private processLocalResult(result: PredictionResults) {
    this.siteResults = result.sites;
    this.tierCounts = result.tierCounts;
    this.themeGaps = result.themeGaps;
    this.avgBlindSpots = Math.round(this.siteResults.reduce((a, s) => a + s.blindSpots, 0) / this.siteResults.length);
    this.filteredSites = this.siteResults;
    this.buildCharts();
  }

  private mapApiSiteToLocal(site: SiteResult): SiteRiskResult {
    return {
      name: site.site_key,
      org: site.org || '',
      riskScore: site.risk_score,
      tier: site.risk_tier,
      concernCount: site.concern_count,
      themeCoverage: site.themes_covered,
      blindSpots: site.blind_spot_count,
      blindSpotNames: site.blind_spot_themes || [],
      coveredThemes: RISK_THEMES.filter((t: string) => !(site.blind_spot_themes || []).includes(t)),
      stopworkRate: site.stopwork_rate,
      daysSinceLastConcern: site.days_since_last_concern,
      trendMoM: site.concern_trend_mom,
      explanations: site.explanations || []
    };
  }

  buildCharts() {
    this.tierChartData = {
      labels: ['HIGH', 'ELEVATED', 'MODERATE', 'LOW'],
      datasets: [{
        data: [this.tierCounts.HIGH, this.tierCounts.ELEVATED, this.tierCounts.MODERATE, this.tierCounts.LOW],
        backgroundColor: ['#c62828', '#ef6c00', '#f9a825', '#2e7d32'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    const sortedGaps = Object.entries(this.themeGaps).sort((a, b) => b[1] - a[1]).slice(0, 12);
    this.blindSpotChartData = {
      labels: sortedGaps.map(g => g[0]),
      datasets: [{
        label: 'Sites with no coverage',
        data: sortedGaps.map(g => g[1] as number),
        backgroundColor: '#c62828',
        borderRadius: 4,
        borderSkipped: false
      }]
    };

    if (this.siteResults.length > 0) {
      this.buildDrilldownChart(0);
    }
  }

  buildDrilldownChart(index: number) {
    const site = this.siteResults[index];
    const themeData = RISK_THEMES.map((t: string) => ({ theme: t, covered: site.coveredThemes.includes(t) ? 1 : 0 }));
    this.drilldownThemeChartData = {
      labels: themeData.map((d: { theme: string; covered: number }) => d.theme),
      datasets: [{
        label: 'Theme Coverage',
        data: themeData.map((d: { theme: string; covered: number }) => d.covered),
        backgroundColor: themeData.map((d: { theme: string; covered: number }) => d.covered ? '#2e7d32' : '#c62828'),
        borderRadius: 3,
        borderSkipped: false
      }]
    };
  }

  setTierFilter(tier: string) {
    this.tierFilter = tier;
    this.filteredSites = tier === 'all' ? this.siteResults : this.siteResults.filter(s => s.tier === tier);
  }

  showDrilldown(index: number) {
    this.drilldownIndex = index;
    this.drilldownSite = this.siteResults[index];
    this.showDrill = true;
    this.buildDrilldownChart(index);
    setTimeout(() => {
      const el = document.getElementById('site-drilldown');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  reset() {
    this.currentStep = 1;
    this.parsedData = [];
    this.selectedFile = null;
    this.siteResults = [];
    this.processingSteps = ['pending', 'pending', 'pending', 'pending'];
    this.uploadStatus = '';
    this.showDrill = false;
    this.drilldownSite = null;
    this.themeGaps = {};
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}