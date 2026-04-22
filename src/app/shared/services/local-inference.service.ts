import { Injectable } from '@angular/core';

export const RISK_THEMES = [
  'Excavation & Trench Work',
  'Vehicle & Mobile Equipment',
  'Suspended Platforms',
  'Machine & Power Tools',
  'Lifting & Rigging',
  'Fall from Height',
  'Lockout/Tagout Violations',
  'Chemical & Hazmat',
  'Hot Work & Welding',
  'Sharp Objects & Cutting',
  'Dropped Objects',
  'Confined Spaces',
  'Environmental Spills',
  'Caught-in / Caught-between',
  'Electrical Hazards',
  'Struck-by Hazards',
  'Slips, Trips & Falls',
  'Forklift & Powered Equipment',
  'Contractor Safety',
  'Scaffolding & Platforms',
  'Crane & Overhead Lifting'
] as const;

export const THEME_KEYWORDS: Record<string, RegExp> = {
  'Excavation & Trench Work': /excavat|trench|dig|soil|shoring|cave.?in|backfill/i,
  'Vehicle & Mobile Equipment': /vehicle|truck|driver|mobile equipment|backing|seatbelt|speed|transport/i,
  'Suspended Platforms': /suspended platform|swing stage|bosun|man.?basket|aerial lift/i,
  'Machine & Power Tools': /machine|power tool|drill|grinder|saw blade|guard|rotating|pinch point/i,
  'Lifting & Rigging': /lift|rigging|sling|shackle|hoist|crane|load|capacity|overload/i,
  'Fall from Height': /fall from|height|roof|ladder|edge|guardrail|harness|lanyard|anchor|tie.?off/i,
  'Lockout/Tagout Violations': /lockout|tagout|loto|energiz|de.?energi|isolation|stored energy/i,
  'Chemical & Hazmat': /chemical|hazmat|hazardous material|sds|msds|toxic|corrosive|spill.*chem/i,
  'Hot Work & Welding': /hot work|weld|cutting torch|burn|fire watch|spark|flash|slag/i,
  'Sharp Objects & Cutting': /sharp|cut|lacerat|blade|knife|puncture|needle|barb|edge.*sharp/i,
  'Dropped Objects': /drop.*object|falling object|overhead|tool.*drop|unsecured.*tool|toe board/i,
  'Confined Spaces': /confined space|permit.?required|atmosphere|ventilat|entry|monitor.*gas|oxygen/i,
  'Environmental Spills': /spill|leak|containment|discharge|stormwater|waste|oil.*ground|berm/i,
  'Caught-in / Caught-between': /caught.?in|caught.?between|crush|pinch|nip point|entangle|compress/i,
  'Electrical Hazards': /electri|shock|arc flash|live wire|exposed.*wire|panel|energized|gfci|ground fault/i,
  'Struck-by Hazards': /struck.?by|hit by|impact|flying|projectile|debris|swing|overhead.*load/i,
  'Slips, Trips & Falls': /slip|trip|fall(?!.*height)|wet|ice|uneven|housekeep|clutter|cable.*floor/i,
  'Forklift & Powered Equipment': /forklift|pallet jack|powered industrial|pit|load.*fork|pedestrian.*fork/i,
  'Contractor Safety': /contractor|sub.?contract|visitor|orient|induct|badge|permit.*work|jsa/i,
  'Scaffolding & Platforms': /scaffold|platform|plank|toe.?board|access|erect.*scaffold|inspect.*scaffold/i,
  'Crane & Overhead Lifting': /crane|overhead|boom|jib|rigging.*crane|load chart|swing radius|outrigger/i
};

export interface ConcernRecord {
  id?: string;
  concern_type?: string;
  incident_task_desc?: string;
  location_nme?: string;
  bus_nme?: string;
  org_nme?: string;
  incident_reported_dt?: string;
  [key: string]: string | undefined;
}

export interface Explanation {
  text: string;
  risk: boolean;
}

export interface SiteRiskResult {
  name: string;
  org: string;
  riskScore: number;
  tier: 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
  concernCount: number;
  themeCoverage: number;
  blindSpots: number;
  blindSpotNames: string[];
  coveredThemes: string[];
  stopworkRate: number;
  daysSinceLastConcern: number;
  trendMoM: number;
  explanations: Explanation[];
}

export interface PredictionResults {
  sites: SiteRiskResult[];
  themeGaps: Record<string, number>;
  tierCounts: {
    HIGH: number;
    ELEVATED: number;
    MODERATE: number;
    LOW: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LocalInferenceService {

  classifyThemes(text: string): string[] {
    if (!text || typeof text !== 'string') return [];
    const matched: string[] = [];
    for (const [theme, regex] of Object.entries(THEME_KEYWORDS)) {
      if (regex.test(text)) matched.push(theme);
    }
    return matched;
  }

  assignTier(score: number): 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW' {
    if (score >= 0.15) return 'HIGH';
    if (score >= 0.08) return 'ELEVATED';
    if (score >= 0.05) return 'MODERATE';
    return 'LOW';
  }

  computeRiskScore(site: Partial<SiteRiskResult>): number {
    let score = 0.04;
    if (site.daysSinceLastConcern! > 60) score += 0.12;
    else if (site.daysSinceLastConcern! > 30) score += 0.06;
    score += (site.blindSpots! / 21) * 0.08;
    if (site.concernCount! <= 2) score += 0.06;
    else if (site.concernCount! <= 5) score += 0.03;
    if (site.stopworkRate === 0) score += 0.03;
    if (site.trendMoM! < -0.3) score += 0.04;
    if (site.themeCoverage! >= 10) score -= 0.04;
    if (site.stopworkRate! > 0.15) score -= 0.03;
    if (site.concernCount! >= 20) score -= 0.02;
    return Math.max(0.01, Math.min(0.40, score));
  }

  generateExplanations(site: Partial<SiteRiskResult>): Explanation[] {
    const explanations: Explanation[] = [];
    if (site.daysSinceLastConcern! > 30) {
      explanations.push({ text: `No concerns filed in ${site.daysSinceLastConcern} days — reporting has gone silent`, risk: true });
    }
    if (site.blindSpots! > 10) {
      explanations.push({ text: `${site.blindSpots} of 21 risk themes have zero concern coverage`, risk: true });
    } else if (site.blindSpots! > 5) {
      explanations.push({ text: `${site.blindSpots} risk themes uncovered — gaps in safety monitoring`, risk: true });
    }
    if (site.concernCount! < 3) {
      explanations.push({ text: `Only ${site.concernCount} concern(s) filed this period — very low activity`, risk: true });
    }
    if (site.stopworkRate === 0 && site.concernCount! > 0) {
      explanations.push({ text: 'Zero stop-work actions — workers may not feel empowered to halt unsafe work', risk: true });
    }
    if (site.trendMoM! < -0.3) {
      explanations.push({ text: `Concern volume dropped ${Math.abs(Math.round(site.trendMoM! * 100))}% from prior period`, risk: true });
    }
    if (site.themeCoverage! >= 10) {
      explanations.push({ text: `${site.themeCoverage} risk themes actively monitored — broad safety awareness`, risk: false });
    }
    if (site.stopworkRate! > 0.15) {
      explanations.push({ text: `${Math.round(site.stopworkRate! * 100)}% stop-work rate — strong safety culture signal`, risk: false });
    }
    if (site.concernCount! >= 20) {
      explanations.push({ text: `${site.concernCount} concerns filed — active reporting culture`, risk: false });
    }
    if (explanations.length === 0) {
      explanations.push({ text: 'Moderate activity levels with some monitoring gaps', risk: true });
    }
    return explanations;
  }

  parseCSV(text: string): ConcernRecord[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: ConcernRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let c = 0; c < lines[i].length; c++) {
        if (lines[i][c] === '"') {
          inQuotes = !inQuotes;
        } else if (lines[i][c] === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += lines[i][c];
        }
      }
      values.push(current.trim());
      if (values.length >= headers.length - 1) {
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => row[h] = values[idx] || '');
        rows.push(row as ConcernRecord);
      }
    }
    return rows;
  }

  runInference(parsedData: ConcernRecord[]): PredictionResults {
    parsedData.forEach(row => {
      (row as any)._themes = this.classifyThemes(row.incident_task_desc || '');
    });

    const siteMap: Record<string, {
      name: string;
      org: string;
      concerns: ConcernRecord[];
      themes: Set<string>;
      stopworkCount: number;
      dates: Date[];
    }> = {};

    parsedData.forEach(row => {
      const site = row.location_nme || 'Unknown';
      if (!siteMap[site]) {
        siteMap[site] = {
          name: site,
          org: row.bus_nme || row.org_nme || '',
          concerns: [],
          themes: new Set(),
          stopworkCount: 0,
          dates: []
        };
      }
      siteMap[site].concerns.push(row);
      const themes = (row as any)._themes as string[];
      themes.forEach(t => siteMap[site].themes.add(t));
      if ((row.concern_type || '').toLowerCase().includes('stop work')) {
        siteMap[site].stopworkCount++;
      }
      if (row.incident_reported_dt) {
        siteMap[site].dates.push(new Date(row.incident_reported_dt));
      }
    });

    const now = new Date();
    const siteResults: SiteRiskResult[] = Object.values(siteMap).map(s => {
      const sortedDates = s.dates.sort((a, b) => b.getTime() - a.getTime());
      const lastDate = sortedDates[0] || new Date('2025-12-01');
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / 86400000);
      const themeCoverage = s.themes.size;
      const blindSpots = 21 - themeCoverage;
      const stopworkRate = s.concerns.length > 0 ? s.stopworkCount / s.concerns.length : 0;
      const mid = Math.floor(s.concerns.length / 2) || 1;
      const trendMoM = s.concerns.length > 4 ? ((s.concerns.length - mid) - mid) / Math.max(mid, 1) : 0;

      const siteObj: Partial<SiteRiskResult> = {
        name: s.name,
        org: s.org,
        concernCount: s.concerns.length,
        themeCoverage,
        blindSpots,
        blindSpotNames: RISK_THEMES.filter(t => !s.themes.has(t)),
        coveredThemes: [...s.themes],
        stopworkRate,
        daysSinceLastConcern: daysSince,
        trendMoM
      };

      siteObj.riskScore = this.computeRiskScore(siteObj);
      siteObj.tier = this.assignTier(siteObj.riskScore);
      siteObj.explanations = this.generateExplanations(siteObj);
      return siteObj as SiteRiskResult;
    });

    siteResults.sort((a, b) => b.riskScore - a.riskScore);

    const themeGaps: Record<string, number> = {};
    RISK_THEMES.forEach(t => themeGaps[t] = 0);
    siteResults.forEach(s => s.blindSpotNames.forEach(t => themeGaps[t]++));

    return {
      sites: siteResults,
      themeGaps,
      tierCounts: {
        HIGH: siteResults.filter(s => s.tier === 'HIGH').length,
        ELEVATED: siteResults.filter(s => s.tier === 'ELEVATED').length,
        MODERATE: siteResults.filter(s => s.tier === 'MODERATE').length,
        LOW: siteResults.filter(s => s.tier === 'LOW').length
      }
    };
  }

  generateDemoData(): ConcernRecord[] {
    const sites = [
      { loc: 'CS - ACS INDIA', org: 'GE Power India', count: 1, pattern: 'silent' },
      { loc: 'PJ-MENAT YandK Turkey', org: 'GE Gas Power', count: 2, pattern: 'silent' },
      { loc: 'Hybrids - Projects', org: 'GE Gas Power', count: 2, pattern: 'silent' },
      { loc: 'OFW Svc California', org: 'GE Onshore Wind', count: 3, pattern: 'declining' },
      { loc: 'GSI LAM Colombia', org: 'GE Gas Power', count: 4, pattern: 'declining' },
      { loc: 'ONW NAM MCE Services', org: 'GE Onshore Wind', count: 12, pattern: 'gaps' },
      { loc: 'ONW LATAM Services', org: 'GE Onshore Wind', count: 14, pattern: 'gaps' },
      { loc: 'ONW NAM Services', org: 'GE Onshore Wind', count: 11, pattern: 'gaps' },
      { loc: 'GP Asia Pacific', org: 'GE Gas Power', count: 30, pattern: 'healthy' },
      { loc: 'GP Europe Services', org: 'GE Gas Power', count: 45, pattern: 'healthy' },
      { loc: 'GP NAM Services', org: 'GE Gas Power', count: 38, pattern: 'healthy' },
      { loc: 'Wind Offshore Atlantic', org: 'GE Offshore Wind', count: 8, pattern: 'gaps' },
      { loc: 'Grid Solutions EMEA', org: 'GE Grid Solutions', count: 25, pattern: 'healthy' }
    ];

    const descriptions: Record<string, string[]> = {
      silent: ['General safety observation noted during site walkthrough', 'Observed area requires general housekeeping attention'],
      declining: ['Cable tray overhead not properly secured to supports', 'Portable heater positioned too close to combustible storage', 'Fire extinguisher access blocked by material stack'],
      gaps: [
        'Scaffold platform missing toe board on north elevation', 'Worker observed grinding without face shield',
        'Forklift operating with obstructed rear visibility in warehouse', 'Chemical drum stored without secondary containment',
        'Fall protection harness inspection tag expired 3 months ago', 'Crane outrigger pad undersized for soil conditions',
        'Ladder base not secured, extends beyond roof edge 2 feet', 'STOP WORK — electrical panel open with exposed bus bars',
        'Tripping hazard from unsecured extension cords across walkway', 'Hot work permit not posted at welding station',
        'STOP WORK — worker in excavation without shoring', 'Suspended platform cable showing visible wear and fraying',
        'Contractor crew working without site-specific orientation badges'
      ],
      healthy: [
        'STOP WORK — crane lift plan not reviewed for wind conditions above 25mph',
        'Confined space atmospheric monitoring showed O2 at 19.2%, below 19.5% threshold',
        'Scaffold inspection tag current, all planks secured, guardrails intact',
        'STOP WORK — excavation deeper than 4ft without protective system',
        'Lockout/tagout procedure not followed during conveyor belt maintenance',
        'Chemical spill kit staged but missing absorbent pads, replenishment ordered',
        'Fall protection anchor point load-tested and certified, lanyard in good condition',
        'Forklift pre-shift inspection completed, horn and lights functional',
        'Hot work fire watch maintained for full 30 minutes after welding completed',
        'Electrical GFCI tested and functioning on all temporary power receptacles',
        'Contractor safety orientation verified for all 12 new personnel this week',
        'Vehicle backup alarm tested, spotter assigned for all reversing operations',
        'Dropped object prevention — all tools tethered on overhead steel work',
        'Machine guard in place on bench grinder, RPM within rated capacity',
        'STOP WORK — suspended load left unattended during crew break',
        'Trench box properly installed, soil classified as Type B, competent person on site',
        'Lifting rigging inspected — slings within SWL, no visible damage or distortion',
        'Slip hazard remediated — ice melt applied to walkway within 15 minutes of report',
        'Crane load chart reviewed, lift within 75% of rated capacity at radius',
        'Emergency exit routes clear, fire extinguishers inspected and tagged current'
      ]
    };

    const rows: ConcernRecord[] = [];
    let idCounter = 200001;
    sites.forEach(site => {
      const descs = descriptions[site.pattern];
      for (let i = 0; i < site.count; i++) {
        const day = site.pattern === 'silent' ? 3 + Math.floor(Math.random() * 4) : Math.floor(Math.random() * 28) + 1;
        const dateStr = `2026-01-${String(day).padStart(2, '0')}`;
        const isStopwork = descs[i % descs.length].startsWith('STOP WORK');
        rows.push({
          id: `C-${idCounter++}`,
          concern_type: isStopwork ? 'Stop Work - Concern' : (Math.random() > 0.7 ? 'Observation' : 'Concern'),
          incident_type: isStopwork ? 'Stop Work; Unsafe Condition' : 'Concern; Unsafe Condition',
          bus_nme: site.org,
          org_nme: site.org.replace('GE ', ''),
          suborg_nme: 'Services',
          location_nme: site.loc,
          coe_nme: site.org.split(' ').pop() + ' Services',
          subcoe_nme: '',
          bldg_nme: '',
          region_nme: site.loc.includes('NAM') ? 'U.S.' : (site.loc.includes('LAM') ? 'LATAM' : (site.loc.includes('EMEA') || site.loc.includes('Europe') ? 'Europe' : (site.loc.includes('Asia') ? 'Asia' : 'Global'))),
          country_nme: '',
          incident_reported_dt: dateStr,
          incident_close_dt: '',
          incident_due_dt: '',
          incident_status_cd: 'Open',
          incident_t: `INC-${idCounter}`,
          incident_task_desc: descs[i % descs.length],
          pse: 'No',
          lsr_category: '',
          worker_type: Math.random() > 0.5 ? 'Contractor' : 'Employee',
          days_open_to_close: '',
          days_past_closure_due: ''
        });
      }
    });
    return rows;
  }
}