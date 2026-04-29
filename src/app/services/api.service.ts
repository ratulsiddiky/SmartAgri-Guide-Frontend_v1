import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Farm } from '../models/farm.model';

export interface FarmPagination {
  page: number;
  limit: number;
  total: number;
  has_next: boolean;
}

export interface FarmListResponse {
  data: Farm[];
  pagination: FarmPagination;
}

export interface FarmMutationResponse {
  message: string;
  farm_id?: string;
}

export interface BroadcastAlertRequest {
  alert_type: string;
  danger_zone: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface BroadcastAlertResponse {
  message: string;
  farms_notified: number;
}

export interface RegionalInsightsResponse {
  message: string;
  data: {
    community_avg_temp: number;
    total_farms_included: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getFarms(page = 1, limit = 20) {
    return this.http.get<Farm[] | FarmListResponse>(
      `${this.baseUrl}/farms?page=${page}&limit=${limit}`
    );
  }

  getFarmById(id: string) {
    return this.http.get<Farm>(`${this.baseUrl}/farms/${id}`);
  }

  searchFarms(query: string) {
    return this.http.get<{ data: Farm[] }>(
      `${this.baseUrl}/farms/search?q=${encodeURIComponent(query)}`
    );
  }

  /**
   * Creates a new farm record in the backend.
   */
  createFarm(data: Partial<Farm>) {
    return this.http.post<FarmMutationResponse>(`${this.baseUrl}/farms`, data);
  }

  /**
   * Updates an existing farm record by identifier.
   */
  updateFarm(id: string, data: Partial<Farm>) {
    return this.http.put<FarmMutationResponse>(`${this.baseUrl}/farms/${id}`, data);
  }

  /**
   * Deletes a farm record by identifier.
   */
  deleteFarm(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/farms/${id}`);
  }

  getFarmInsights(id: string) {
    return this.http.get<{ dashboard_data: unknown }>(
      `${this.baseUrl}/farms/${id}/insights`
    );
  }

  checkIrrigation(id: string) {
    return this.http.get<unknown>(`${this.baseUrl}/farms/${id}/irrigation_check`);
  }

  syncWeather(id: string) {
    return this.http.post<void>(`${this.baseUrl}/farms/${id}/sync_weather`, {});
  }

  addSensor(id: string, sensor: { sensor_id: string; type: string }) {
    return this.http.post<void>(`${this.baseUrl}/farms/${id}/sensors`, sensor);
  }

  /**
   * Broadcasts an emergency alert to farms inside a GeoJSON polygon.
   */
  broadcastAlert(payload: BroadcastAlertRequest) {
    return this.http.post<BroadcastAlertResponse>(
      `${this.baseUrl}/farms/alerts/broadcast`,
      payload
    );
  }

  /**
   * Fetches community weather averages for a region name.
   */
  getRegionalInsights(regionName: string) {
    return this.http.get<RegionalInsightsResponse>(
      `${this.baseUrl}/farms/region/${encodeURIComponent(regionName)}/insights`
    );
  }
}
