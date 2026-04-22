# GE Vernova EHS — Angular Dashboard

A complete Angular front-end matching the HTML dashboard. All 10 tabs, Azure AD auth, and Live Predictions pipeline.

---

## Quick Start

### 1. Install dependencies
```
cd gev-ehs-angular
npm install --legacy-peer-deps
```

### 2. Run locally
```
npm start
```
Opens at `http://localhost:4200`

---

## Building for Deployment

### Development build
```
npm run build
```

### Production build
```
npm run build
```

Output goes to: `dist/browser/`

---

## Deploy to Netlify (Drag & Drop)

1. Run `npm run build`
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the **entire `dist/browser/` folder** into the drop zone
4. Netlify will give you a public URL

That's it. Same as your React app.

---

## App Tabs

| Tab | Description |
|-----|-------------|
| Executive Summary | Key metrics, 3 big findings |
| Data Foundation | Source data table, concern volume chart |
| Architecture | Medallion pattern on Databricks |
| Silence = Danger | Central finding with site comparisons |
| Site Risk Board | Top 15 sites by serious incidents |
| Risk Themes | 21 hazard categories, danger reduction chart |
| Site Risk Model | LightGBM model, risk tiers, feature importance |
| Features | 24 concern-derived signals breakdown |
| Actions & Value | Recommended actions, business case |
| ⚡ Live Predictions | CSV upload → theme classification → site scoring |

---

## Authentication

The app uses Azure AD (Microsoft Entra ID) via MSAL.

### To configure auth:

1. Create an App Registration in Azure AD
2. Update these values in `src/app/app.config.ts`:
   - `clientId` — your Azure app client ID
   - `authority` — your tenant URL
   - `scopes` — your API scope

### To disable auth (local dev without Azure):
In `app.config.ts`, change the MSAL config to use a mock:

```typescript
// For local dev without Azure AD, set auth_enabled = false
// The login overlay will not appear
```

---

## Data

All data is hardcoded to match the original HTML:
- 6,148 contractor incidents (2020–2025)
- 1,035,474 concern/stopwork records
- 384 GE Vernova sites
- 21 LLM-extracted risk themes

---

## File Structure

```
gev-ehs-angular/
├── src/
│   ├── app/
│   │   ├── features/dashboard/     ← All 10 tab components
│   │   │   ├── executive-summary/
│   │   │   ├── data-foundation/
│   │   │   ├── architecture/
│   │   │   ├── silence-danger/
│   │   │   ├── site-risk-board/
│   │   │   ├── risk-themes/
│   │   │   ├── site-risk-model/
│   │   │   ├── features/
│   │   │   ├── actions-value/
│   │   │   └── live-predictions/
│   │   ├── shared/services/        ← Local inference service
│   │   ├── app.component.ts        ← Main layout + nav
│   │   ├── app.config.ts           ← Auth config
│   │   └── app.routes.ts           ← Routing
│   ├── styles.scss                 ← All CSS styles
│   └── index.html
└── package.json
```

---

## Live Predictions Pipeline

Tab 10 runs a complete risk pipeline locally (no Databricks required):

1. **Upload CSV** — drag & drop or use demo data
2. **Preview** — see row count, sites identified
3. **Processing** — animated steps:
   - Theme Classification (keyword matching across 21 themes)
   - Site Aggregation (volumes, trends, coverage)
   - Risk Scoring (heuristic model matching Databricks output)
   - Explanation Generation (plain-English reasons)
4. **Results Dashboard** — tier distribution, blind spots, site table, drilldown

---

## API Backend (Optional)

The original `api_server.py` connects this frontend to Databricks ML models. To use it:

1. Update `DATABRICKS_HOST` and `DATABRICKS_TOKEN` in `.env`
2. Run `python api_server.py` from the parent directory
3. App will detect the backend and use Databricks for predictions instead of local inference

See `api_server.py` for full documentation.