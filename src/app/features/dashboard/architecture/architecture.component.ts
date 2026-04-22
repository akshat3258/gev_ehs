import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>Data Architecture: Medallion Pattern on Databricks</h2>

        <div style="background:linear-gradient(135deg,#f8fafc 0%,#eef2f7 100%);border-radius:8px;padding:20px;margin:20px 0">
          <div style="text-align:center;font-size:20px;color:#1B3A5C;font-weight:700;margin-bottom:16px">
            Raw Files &rarr; Bronze &rarr; Silver &rarr; Gold &rarr; ML Features &rarr; Predictions &rarr; Risk Tiers
          </div>

          <div class="arch-stage">
            <h4>Bronze Layer (Raw Ingestion)</h4>
            <div class="arch-row"><strong>bronze_incidents_cw</strong> (6,148) | <strong>bronze_concerns</strong> (1,035,474)</div>
            <div class="arch-row" style="color:#999;font-size:11px">No transformations — raw as received from GEV</div>
          </div>
          <div class="arch-arrow">&darr;</div>
          <div class="arch-stage">
            <h4>Silver Layer (Cleaned & Standardized)</h4>
            <div class="arch-row"><strong>silver_incidents_cw</strong> (6,148) | <strong>silver_concerns</strong> (1,035,474)</div>
            <div class="arch-row" style="color:#999;font-size:11px">Validation, nulls handled, dates normalized, LLM risk_theme columns added</div>
          </div>
          <div class="arch-arrow">&darr;</div>
          <div class="arch-stage">
            <h4>Gold Layer (Star Schema)</h4>
            <div class="arch-row"><strong>fact_incidents_cw</strong> (6,148) | <strong>fact_concerns</strong> (1,035,474) | <strong>dim_site_mapping</strong> (384)</div>
            <div class="arch-row" style="color:#999;font-size:11px">Site keys mapped, risk themes indexed, concern matching enabled</div>
          </div>
          <div class="arch-arrow">&darr;</div>
          <div class="arch-stage">
            <h4>ML Layer</h4>
            <div class="arch-row"><strong>ml_features_v3_cw</strong> (6,148 &times; 80+ features) | <strong>ml_calibrated_predictions</strong> (1,234 test set)</div>
            <div class="arch-row"><strong>ml_keyword_analysis</strong> (20 risk themes) | <strong>ml_feature_importance</strong> | <strong>ml_shap_importance</strong></div>
          </div>
        </div>

        <h3>Key Tables</h3>
        <table>
          <thead><tr><th>Table</th><th>Rows</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td>fact_incidents_cw</td><td>6,148</td><td>Gold incidents with site_key, risk_theme, severity labels</td></tr>
            <tr><td>fact_concerns</td><td>1,035,474</td><td>Gold concerns with site_key, matched_risk_themes</td></tr>
            <tr><td>dim_site_mapping</td><td>384</td><td>Canonical site master with incident &amp; concern name mapping</td></tr>
            <tr><td>ml_site_risk_features</td><td>varies</td><td>24 concern-derived features per site&times;month for risk prediction</td></tr>
            <tr><td>ml_site_risk_predictions</td><td>varies</td><td>Site risk scores with SHAP explanations on temporal test set</td></tr>
            <tr><td>ml_theme_classifier_metrics</td><td>21</td><td>Per-theme classifier performance (precision, recall, F1)</td></tr>
            <tr><td>ml_keyword_analysis</td><td>21</td><td>Risk theme protective analysis — danger reduction % for each theme</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ArchitectureComponent {}