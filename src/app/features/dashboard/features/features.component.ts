import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>Feature Engineering: 24 Concern-Derived Signals</h2>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          Every feature is derived from concern data — the model uses <strong>zero lagging indicators</strong> at prediction time.
          This is what makes it a genuine early warning system: it scores sites based on what people are reporting <em>now</em>,
          not what happened in the past.
        </p>

        <div class="feature-grid">
          <div class="feature-card concern-derived">
            <h4>Concern Volume</h4>
            <div class="count">4</div>
            <div>Concern counts over 30, 60, 90, and 180-day windows — how active is reporting at this site?</div>
          </div>
          <div class="feature-card concern-derived">
            <h4>Theme Coverage</h4>
            <div class="count">4</div>
            <div>Themes covered count, coverage %, blind spot count, themed concern ratio — how broadly is the site monitoring hazards?</div>
          </div>
          <div class="feature-card concern-derived">
            <h4>Silence Detection</h4>
            <div class="count">3</div>
            <div>Days since last concern, days since last themed concern, is-below-half-average flag — has reporting gone quiet?</div>
          </div>
          <div class="feature-card concern-derived">
            <h4>Stop-Work Indicators</h4>
            <div class="count">2</div>
            <div>Stop-work count and stop-work rate — are workers empowered to halt unsafe conditions?</div>
          </div>
          <div class="feature-card concern-derived">
            <h4>Trend Analysis</h4>
            <div class="count">3</div>
            <div>Month-over-month trend, rolling 3-month average, below-average flag — is activity declining?</div>
          </div>
          <div class="feature-card concern-derived">
            <h4>Site Profile</h4>
            <div class="count">4</div>
            <div>Cumulative concerns, historical incident count, serious count, serious rate — site's overall safety history</div>
          </div>
          <div class="feature-card concern-derived">
            <h4>Interaction Terms</h4>
            <div class="count">2</div>
            <div>Blind spots &times; volume, blind spots &times; stop-work rate — compound risk when gaps meet low activity</div>
          </div>
          <div class="feature-card concern-derived">
            <h4>Themed Concern Density</h4>
            <div class="count">2</div>
            <div>Themed concern count (90d), themed concern ratio — what proportion of concerns target specific hazards?</div>
          </div>
        </div>

        <div class="biz-explain">
          <strong>Key Insight:</strong> The model's most powerful signals are <strong>silence</strong> (days since last concern),
          <strong>blind spots</strong> (themes with zero coverage), and <strong>declining trends</strong> (month-over-month drops).
          When a site stops reporting, loses theme breadth, or shows falling concern volumes — that's when serious incidents follow.
          Every feature is available from uploaded concern data alone, making real-time prediction possible.
        </div>
      </div>
    </div>
  `
})
export class FeaturesComponent {}