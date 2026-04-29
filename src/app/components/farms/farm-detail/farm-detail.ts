import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Farm, FarmSensor } from '../../../models/farm.model';
import { FarmService } from '../../../services/farm.service';
import { HighlightStatusDirective } from '../../../directives/highlight-status.directive';

interface FarmInsights {
  average_temp?: number;
  average_wind?: number;
  [key: string]: unknown;
}

interface IrrigationStatus {
  status?: string;
  moisture?: number;
  [key: string]: unknown;
}

@Component({
  selector: 'app-farm-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HighlightStatusDirective],
  templateUrl: './farm-detail.html',
  styleUrl: './farm-detail.css',
})
export class FarmDetail implements OnInit {
  farm: Farm | null = null;
  insights: FarmInsights | null = null;
  irrigation: IrrigationStatus | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  syncLoading = false;
  syncMessage = '';
  toastMessage = '';
  toastType: 'success' | 'danger' = 'success';
  showSensorForm = false;
  newSensor: FarmSensor = { sensor_id: '', type: '' };
  sensorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly farmService: FarmService
  ) {}

  private getErrorMessage(error: unknown, fallback: string): string {
    const backendMessage = (error as { error?: { message?: unknown } } | null)?.error
      ?.message;
    return typeof backendMessage === 'string' && backendMessage.trim()
      ? backendMessage
      : fallback;
  }

  get farmId(): string {
    return this.route.snapshot.paramMap.get('id') || '';
  }

  // Lifecycle hook now only handles initialization
  ngOnInit() {
    if (!this.farmId || this.farmId === 'undefined') {
      this.error = true;
      this.errorMessage =
        'The farm identifier is missing or invalid. Please return to All Farms and try again.';
      this.loading = false;
      return;
    }
    this.loadFarmData(); // Call the dedicated refresh method
  }

  // Extracted logic into a reusable method
  private loadFarmData(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';

    this.farmService
      .getFarmById(this.farmId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.farm = data;
          this.loadInsights();
          this.loadIrrigation();
        },
        error: (err) => {
          this.error = true;
          this.errorMessage = this.getErrorMessage(
            err,
            `Unable to load farm '${this.farmId}'. Please refresh and try again.`
          );
          console.error(this.errorMessage);
        },
      });
  }

  loadInsights() {
    this.farmService.getFarmInsights(this.farmId).subscribe({
      next: (data) => (this.insights = data.dashboard_data as FarmInsights),
      error: (err) => {
        console.error(
          this.getErrorMessage(
            err,
            `Unable to load insights for farm '${this.farmId}'.`
          )
        );
      },
    });
  }

  loadIrrigation() {
    this.farmService.checkIrrigation(this.farmId).subscribe({
      next: (data) => (this.irrigation = data as IrrigationStatus),
      error: (err) => {
        console.error(
          this.getErrorMessage(
            err,
            `Unable to calculate irrigation status for farm '${this.farmId}'.`
          )
        );
      },
    });
  }

  syncWeather() {
    this.syncLoading = true;
    this.syncMessage = '';
    this.farmService.syncWeather(this.farmId).subscribe({
      next: () => {
        this.syncMessage = '✅ Weather synced successfully.';
        this.showToast('Weather synced successfully.', 'success');
        this.syncLoading = false;
        this.loadFarmData(); // Replaced this.ngOnInit() with this.loadFarmData()
      },
      error: (err) => {
        const message = this.getErrorMessage(
          err,
          `Weather sync failed for farm '${this.farmId}'. Please verify the coordinates and try again.`
        );
        this.syncMessage = `❌ ${message}`;
        this.showToast(message, 'danger');
        this.syncLoading = false;
      },
    });
  }

  addSensor() {
    if (!this.newSensor.sensor_id || !this.newSensor.type) {
      this.sensorMessage = 'Please fill in both fields.';
      return;
    }
    this.farmService.addSensor(this.farmId, this.newSensor).subscribe({
      next: () => {
        this.sensorMessage = 'Sensor added successfully.';
        this.showSensorForm = false;
        this.newSensor = { sensor_id: '', type: '' };
        this.loadFarmData(); // Replaced this.ngOnInit() with this.loadFarmData()
      },
      error: (err) => {
        this.sensorMessage = this.getErrorMessage(
          err,
          `Unable to add the sensor to farm '${this.farmId}'. Please check the sensor details and try again.`
        );
      },
    });
  }

  /**
   * Displays temporary toast feedback for key user actions.
   */
  showToast(message: string, type: 'success' | 'danger'): void {
    this.toastMessage = message;
    this.toastType = type;
    window.setTimeout(() => {
      this.toastMessage = '';
    }, 2500);
  }
}