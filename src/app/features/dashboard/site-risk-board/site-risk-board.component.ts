import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Site {
  name: string;
  incidents: number;
  serious: number;
  seriousRate: string;
  concerns: number;
  concernsPerInc: string;
  themed: number;
  highRiskInc: number;
  avgModelRisk: string;
  isBlindSpot?: boolean;
}

@Component({
  selector: 'app-site-risk-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content active">
      <div class="card">
        <h2>Site Risk Board: Top 30 Sites by Serious Incidents</h2>
        <p style="font-size:14px;color:#555;margin-bottom:16px">
          Sites ranked by serious incident count, with concern activity and model risk scores.
          Red-flagged sites have high serious rates with low concern coverage.
        </p>

        <table>
          <thead>
            <tr>
              <th>Site</th>
              <th>Incidents</th>
              <th>Serious</th>
              <th>Serious %</th>
              <th>Concerns</th>
              <th>Concerns/Inc</th>
              <th>Themed</th>
              <th>High-Risk Inc</th>
              <th>Avg Model Risk</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let site of sites" [style.background]="site.isBlindSpot ? '#fff8f8' : ''">
              <td><strong>{{ site.name }}</strong></td>
              <td>{{ site.incidents }}</td>
              <td [class.danger]="site.isBlindSpot">{{ site.serious }}</td>
              <td [class.danger]="site.isBlindSpot">{{ site.seriousRate }}</td>
              <td>{{ site.concerns }}</td>
              <td [class.danger]="site.isBlindSpot">{{ site.concernsPerInc }}</td>
              <td>{{ site.themed }}</td>
              <td>{{ site.highRiskInc }}</td>
              <td>{{ site.avgModelRisk }}</td>
            </tr>
          </tbody>
        </table>

        <div class="biz-explain">
          <strong>How to Read This Table:</strong> The "Concerns/Inc" column is the key metric. Sites below 1.0 have almost no early warning capability.
          "Themed" shows how many concerns matched one of the 21 known risk themes — zero themed concerns at a site with serious incidents is a critical gap.
          Red-highlighted rows are blind spots requiring immediate investigation.
        </div>
      </div>
    </div>
  `
})
export class SiteRiskBoardComponent {
  sites: Site[] = [
    { name: 'ONW LATAM Projects', incidents: 256, serious: 22, seriousRate: '8.6%', concerns: 78, concernsPerInc: '0.3', themed: 20, highRiskInc: 0, avgModelRisk: '0.000', isBlindSpot: true },
    { name: 'ONW NAM Services', incidents: 409, serious: 28, seriousRate: '6.8%', concerns: 12724, concernsPerInc: '31.1', themed: 2375, highRiskInc: 4, avgModelRisk: '0.045', isBlindSpot: false },
    { name: 'ONW APAC Projects', incidents: 474, serious: 21, seriousRate: '4.4%', concerns: 2911, concernsPerInc: '6.1', themed: 388, highRiskInc: 0, avgModelRisk: '0.030', isBlindSpot: false },
    { name: 'ONW NAM Projects', incidents: 315, serious: 21, seriousRate: '6.7%', concerns: 2405, concernsPerInc: '7.6', themed: 455, highRiskInc: 4, avgModelRisk: '0.051', isBlindSpot: false },
    { name: 'GSI APAC', incidents: 384, serious: 21, seriousRate: '5.5%', concerns: 6085, concernsPerInc: '15.8', themed: 927, highRiskInc: 7, avgModelRisk: '0.060', isBlindSpot: false },
    { name: 'ONW NAM MCE Services', incidents: 144, serious: 16, seriousRate: '11.1%', concerns: 1271, concernsPerInc: '8.8', themed: 480, highRiskInc: 1, avgModelRisk: '0.039', isBlindSpot: false },
    { name: 'GP Projects - Asia', incidents: 179, serious: 14, seriousRate: '7.8%', concerns: 22139, concernsPerInc: '123.7', themed: 6612, highRiskInc: 0, avgModelRisk: '0.047', isBlindSpot: false },
    { name: 'GSI LAM', incidents: 81, serious: 12, seriousRate: '14.8%', concerns: 2534, concernsPerInc: '31.3', themed: 80, highRiskInc: 1, avgModelRisk: '0.047', isBlindSpot: false },
    { name: 'ONW EMEA Projects', incidents: 210, serious: 12, seriousRate: '5.7%', concerns: 1629, concernsPerInc: '7.8', themed: 280, highRiskInc: 0, avgModelRisk: '0.037', isBlindSpot: false },
    { name: 'SP Steam Services India', incidents: 97, serious: 11, seriousRate: '11.3%', concerns: 3071, concernsPerInc: '31.7', themed: 847, highRiskInc: 3, avgModelRisk: '0.065', isBlindSpot: false },
    { name: 'OFW Services', incidents: 43, serious: 11, seriousRate: '25.6%', concerns: 2556, concernsPerInc: '59.4', themed: 196, highRiskInc: 1, avgModelRisk: '0.075', isBlindSpot: true },
    { name: 'GP Projects - Middle East', incidents: 371, serious: 11, seriousRate: '3.0%', concerns: 13223, concernsPerInc: '35.6', themed: 3105, highRiskInc: 0, avgModelRisk: '0.000', isBlindSpot: false },
    { name: 'CS - ACS INDIA', incidents: 11, serious: 7, seriousRate: '63.6%', concerns: 6, concernsPerInc: '0.5', themed: 0, highRiskInc: 0, avgModelRisk: '0.000', isBlindSpot: true },
    { name: 'PJ-MENAT YandK Project Turkey', incidents: 32, serious: 8, seriousRate: '25.0%', concerns: 19, concernsPerInc: '0.6', themed: 15, highRiskInc: 0, avgModelRisk: '0.000', isBlindSpot: true },
    { name: 'PJ-IN Simhadri India', incidents: 28, serious: 8, seriousRate: '28.6%', concerns: 1386, concernsPerInc: '49.5', themed: 586, highRiskInc: 0, avgModelRisk: '0.058', isBlindSpot: false }
  ];
}