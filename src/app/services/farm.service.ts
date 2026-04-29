import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import {
  ApiService,
  BroadcastAlertRequest,
  FarmListResponse,
} from './api.service';
import { Farm } from '../models/farm.model';

export interface FarmListResult {
  data: Farm[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_next: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FarmService {
  constructor(private readonly api: ApiService) {}

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;
      if (typeof backendMessage === 'string' && backendMessage.trim()) {
        return backendMessage;
      }

      if (error.status === 400) {
        return 'The request could not be completed because the farm data was invalid.';
      }

      if (error.status === 401) {
        return 'You are not signed in or your session has expired. Please log in again.';
      }

      if (error.status === 403) {
        return 'You do not have permission to perform this farm action.';
      }

      if (error.status === 404) {
        return 'The requested farm record could not be found.';
      }

      if (error.status >= 500) {
        return 'The server was unable to complete the farm request. Please try again later.';
      }

      return fallback;
    }

    if (error instanceof Error && error.message.trim()) {
      if (error.message.toLowerCase().includes('timeout')) {
        return 'The server took too long to process this farm request. Please try again.';
      }

      return error.message;
    }

    return fallback;
  }

  private rethrowAsHttpError(error: unknown, fallback: string) {
    const message = this.resolveErrorMessage(error, fallback);
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    const statusText = error instanceof HttpErrorResponse ? error.statusText : 'Unknown Error';

    return throwError(
      () =>
        new HttpErrorResponse({
          error: { message },
          status,
          statusText,
          url: error instanceof HttpErrorResponse ? error.url ?? undefined : undefined,
        })
    );
  }

  getFarms(page = 1, limit = 9) {
    return this.api.getFarms(page, limit).pipe(
      map((response): FarmListResult => {
        if (Array.isArray(response)) {
          return {
            data: response,
            pagination: {
              page,
              limit,
              total: response.length,
              has_next: false,
            },
          };
        }

        const typedResponse = response as FarmListResponse;
        return {
          data: typedResponse.data || [],
          pagination: {
            page: typedResponse.pagination?.page ?? page,
            limit: typedResponse.pagination?.limit ?? limit,
            total: typedResponse.pagination?.total ?? 0,
            has_next: typedResponse.pagination?.has_next ?? false,
          },
        };
      }),
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          'Unable to load farms right now. Please check your connection and try again.'
        )
      )
    );
  }

  getFarmById(id: string) {
    return this.api.getFarmById(id).pipe(
      timeout(12000),
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to load farm '${id}'. Please check the identifier and try again.`
        )
      )
    );
  }

  searchFarms(query: string) {
    return this.api.searchFarms(query).pipe(
      map((response) => response.data || []),
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to search farms for '${query}'. Please try a different keyword.`
        )
      )
    );
  }

  createFarm(data: Partial<Farm>) {
    return this.api.createFarm(data).pipe(
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          'Unable to create the farm. Please correct the form fields and try again.'
        )
      )
    );
  }

  updateFarm(id: string, data: Partial<Farm>) {
    return this.api.updateFarm(id, data).pipe(
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to update farm '${id}'. Please review your changes and try again.`
        )
      )
    );
  }

  deleteFarm(id: string) {
    return this.api.deleteFarm(id).pipe(
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to delete farm '${id}'. Please confirm you have permission and try again.`
        )
      )
    );
  }

  getFarmInsights(id: string) {
    return this.api.getFarmInsights(id).pipe(
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to generate insights for farm '${id}'. Add weather logs and try again.`
        )
      )
    );
  }

  checkIrrigation(id: string) {
    return this.api.checkIrrigation(id).pipe(
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to calculate irrigation status for farm '${id}'.` 
        )
      )
    );
  }

  syncWeather(id: string) {
    return this.api.syncWeather(id).pipe(
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to sync weather for farm '${id}'. Please check the location coordinates and try again.`
        )
      )
    );
  }

  addSensor(id: string, sensor: { sensor_id: string; type: string }) {
    return this.api.addSensor(id, sensor).pipe(
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to add sensor '${sensor.sensor_id}' to farm '${id}'. Please verify the sensor details and try again.`
        )
      )
    );
  }

  /**
   * Sends an admin broadcast alert for farms inside the provided danger zone.
   */
  broadcastAlert(payload: BroadcastAlertRequest) {
    return this.api.broadcastAlert(payload).pipe(
      timeout(12000),
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          'Unable to broadcast the alert. Please confirm the danger zone and alert type.'
        )
      )
    );
  }

  /**
   * Retrieves region-level community weather insight metrics.
   */
  getRegionalInsights(regionName: string) {
    return this.api.getRegionalInsights(regionName).pipe(
      catchError((error) =>
        this.rethrowAsHttpError(
          error,
          `Unable to load community insights for '${regionName}'. Please try again shortly.`
        )
      )
    );
  }
}
