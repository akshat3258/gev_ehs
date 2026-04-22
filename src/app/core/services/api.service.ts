import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface PredictionResponse {
  status: string;
  upload_id: string;
  input_rows: number;
  sites_scored: number;
  results: {
    sites: SiteResult[];
    theme_gaps: Record<string, number>;
    tier_counts: {
      HIGH: number;
      ELEVATED: number;
      MODERATE: number;
      LOW: number;
    };
  };
}

export interface SiteResult {
  site_key: string;
  org?: string;
  risk_score: number;
  risk_tier: 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
  concern_count: number;
  themes_covered: number;
  blind_spot_count: number;
  blind_spot_themes: string[];
  explanations: { text: string; risk: boolean }[];
  stopwork_rate: number;
  days_since_last_concern: number;
  concern_trend_mom: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }

  async predict(file: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/predict`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Prediction failed: ${error}`);
    }

    return await response.json();
  }

  async predictLocal(file: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/predict-local`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Local prediction failed: ${error}`);
    }

    return await response.json();
  }

  async runPrediction(file: File): Promise<PredictionResponse | null> {
    // Try Databricks endpoint first
    try {
      return await this.predict(file);
    } catch (error) {
      console.log('Databricks endpoint failed:', error);
    }

    // Fall back to local inference endpoint
    try {
      return await this.predictLocal(file);
    } catch (error) {
      console.error('Local endpoint also failed:', error);
      return null;
    }
  }

  getBackendUrl(): string {
    return this.baseUrl;
  }
}