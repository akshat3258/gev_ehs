import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
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

export interface HealthResponse {
  status: 'ok' | 'error';
  cluster_id?: string;
  detail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        signal: AbortSignal.timeout(5000)
      });
      return await response.json();
    } catch {
      return { status: 'error', detail: 'Backend not reachable' };
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

  async runPrediction(file: File | null, csvContent?: string): Promise<PredictionResponse | null> {
    // Try API first
    const apiAvailable = await this.checkApiAvailable();

    if (apiAvailable && file) {
      try {
        // Try Databricks endpoint first
        return await this.predict(file);
      } catch (error) {
        console.log('Databricks endpoint failed, trying local:', error);
        // Fall back to local endpoint
        try {
          return await this.predictLocal(file);
        } catch (localError) {
          console.error('Local endpoint also failed:', localError);
          return null;
        }
      }
    }

    // If no file but CSV content exists, create a blob
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const tempFile = new File([blob], 'upload.csv');
      try {
        return await this.predictLocal(tempFile);
      } catch {
        return null;
      }
    }

    return null;
  }

  private async checkApiAvailable(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'ok';
    } catch {
      return false;
    }
  }

  getBackendUrl(): string {
    return this.baseUrl;
  }
}