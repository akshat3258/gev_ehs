import { Routes } from '@angular/router';
import { ExecutiveSummaryComponent } from './features/dashboard/executive-summary/executive-summary.component';
import { DataFoundationComponent } from './features/dashboard/data-foundation/data-foundation.component';
import { ArchitectureComponent } from './features/dashboard/architecture/architecture.component';
import { SilenceDangerComponent } from './features/dashboard/silence-danger/silence-danger.component';
import { SiteRiskBoardComponent } from './features/dashboard/site-risk-board/site-risk-board.component';
import { RiskThemesComponent } from './features/dashboard/risk-themes/risk-themes.component';
import { SiteRiskModelComponent } from './features/dashboard/site-risk-model/site-risk-model.component';
import { FeaturesComponent } from './features/dashboard/features/features.component';
import { ActionsValueComponent } from './features/dashboard/actions-value/actions-value.component';
import { LivePredictionsComponent } from './features/dashboard/live-predictions/live-predictions.component';

export const routes: Routes = [
  { path: '', redirectTo: 'exec-summary', pathMatch: 'full' },
  { path: 'exec-summary', component: ExecutiveSummaryComponent },
  { path: 'data-foundation', component: DataFoundationComponent },
  { path: 'architecture', component: ArchitectureComponent },
  { path: 'silence-danger', component: SilenceDangerComponent },
  { path: 'site-risk', component: SiteRiskBoardComponent },
  { path: 'risk-themes', component: RiskThemesComponent },
  { path: 'model', component: SiteRiskModelComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'actions', component: ActionsValueComponent },
  { path: 'predictions', component: LivePredictionsComponent },
];