import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { FarmService } from '../../../services/farm.service';
import { BroadcastAlertRequest } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  readonly authService = inject(AuthService);

  readonly broadcastForm = new FormGroup({
    alert_type: new FormControl('Flood', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    danger_zone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly insightsForm = new FormGroup({
    region_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  alertLoading = false;
  insightsLoading = false;
  alertMessage = '';
  alertError = '';
  insightsError = '';
  farmsNotified = 0;
  totalFarmsTracked = 0;
  statsLoading = true;
  insightsData: { community_avg_temp: number; total_farms_included: number } | null =
    null;

  constructor(private readonly farmService: FarmService) {}

  get greetingName(): string {
    const user = this.authService.currentUserSignal();

    if (!user) {
      return 'Admin';
    }

    if ((user.role || '').toLowerCase() === 'admin') {
      return 'Admin';
    }

    return user.username || 'Admin';
  }

  ngOnInit(): void {
    this.loadQuickStats();
  }

  private setBroadcastLoading(isLoading: boolean): void {
    this.alertLoading = isLoading;

    if (isLoading) {
      this.broadcastForm.disable({ emitEvent: false });
      return;
    }

    this.broadcastForm.enable({ emitEvent: false });
  }

  private setInsightsLoading(isLoading: boolean): void {
    this.insightsLoading = isLoading;

    if (isLoading) {
      this.insightsForm.disable({ emitEvent: false });
      return;
    }

    this.insightsForm.enable({ emitEvent: false });
  }

  private loadQuickStats(): void {
    this.statsLoading = true;

    this.farmService.getFarms(1, 1).subscribe({
      next: (response) => {
        this.totalFarmsTracked =
          response.pagination?.total ?? response.data?.length ?? 0;
        this.statsLoading = false;
      },
      error: () => {
        this.totalFarmsTracked = 0;
        this.statsLoading = false;
      },
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const backendMessage = (error as { error?: { message?: unknown } } | null)?.error
      ?.message;

    return typeof backendMessage === 'string' && backendMessage.trim()
      ? backendMessage
      : fallback;
  }

  /**
   * Broadcasts an admin alert to farms within the provided GeoJSON polygon.
   */
  onBroadcast(): void {
    if (this.broadcastForm.invalid) {
      this.broadcastForm.markAllAsTouched();
      return;
    }

    this.setBroadcastLoading(true);
    this.alertMessage = '';
    this.alertError = '';

    const rawZone = this.broadcastForm.controls.danger_zone.value.trim();
    const parsedZone = this.parseDangerZone(rawZone);

    if (!parsedZone) {
      this.setBroadcastLoading(false);
      this.alertError =
        'danger_zone must be valid GeoJSON Polygon JSON with coordinates.';
      return;
    }

    const payload: BroadcastAlertRequest = {
      alert_type: this.broadcastForm.controls.alert_type.value,
      danger_zone: parsedZone,
    };

    this.farmService
      .broadcastAlert(payload)
      .pipe(finalize(() => this.setBroadcastLoading(false)))
      .subscribe({
        next: (response) => {
          this.farmsNotified = response.farms_notified;
          this.alertMessage = response.message || 'Alert broadcast successful.';
        },
        error: (err) => {
          this.alertError = this.getErrorMessage(
            err,
            'Alert broadcast failed. The request timed out or the server could not process the GeoJSON polygon.'
          );
        },
      });
  }

  /**
   * Loads regional insight metrics for the selected area name.
   */
  loadRegionalInsights(): void {
    if (this.insightsForm.invalid) {
      this.insightsForm.markAllAsTouched();
      return;
    }

    this.setInsightsLoading(true);
    this.insightsError = '';
    this.insightsData = null;

    const regionName = this.insightsForm.controls.region_name.value.trim();

    this.farmService
      .getRegionalInsights(regionName)
      .pipe(finalize(() => this.setInsightsLoading(false)))
      .subscribe({
        next: (response) => {
          this.insightsData = response.data;
        },
        error: (err) => {
          this.insightsError = this.getErrorMessage(
            err,
            'Regional insights are unavailable for this region. Please try another area name.'
          );
        },
      });
  }

  /**
   * Validates and parses a GeoJSON polygon payload.
   */
  private parseDangerZone(
    rawJson: string
  ): { type: 'Polygon'; coordinates: number[][][] } | null {
    try {
      const parsed = JSON.parse(rawJson) as {
        type?: string;
        coordinates?: unknown;
      };

      if (
        parsed.type !== 'Polygon' ||
        !Array.isArray(parsed.coordinates) ||
        parsed.coordinates.length === 0
      ) {
        return null;
      }

      return {
        type: 'Polygon',
        coordinates: parsed.coordinates as number[][][],
      };
    } catch {
      return null;
    }
  }
}
