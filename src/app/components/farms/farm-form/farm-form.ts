import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-farm-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './farm-form.html',
  styleUrl: './farm-form.css',
})
export class FarmForm implements OnInit {
  readonly farmForm = new FormGroup({
    farm_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    crop_type: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    area_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  isEditMode = false;
  farmId = '';
  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {}

  private getErrorMessage(error: unknown, fallback: string): string {
    const backendMessage = (error as { error?: { message?: unknown } } | null)?.error
      ?.message;

    return typeof backendMessage === 'string' && backendMessage.trim()
      ? backendMessage
      : fallback;
  }

  /**
   * Initializes form mode and loads existing farm data for edit flow.
   */
  ngOnInit(): void {
    this.farmForm.enable();
    this.farmId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.farmId;

    if (this.isEditMode) {
      this.loadFarmForEdit();
    }
  }

  /**
   * Loads existing farm details and patches form values for editing.
   */
  loadFarmForEdit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.farmForm.disable();

    this.apiService.getFarmById(this.farmId).subscribe({
      next: (farm) => {
        this.farmForm.patchValue({
          farm_name: farm.farm_name || '',
          crop_type: farm.crop_type || '',
          area_name: farm.address?.area_name || '',
        });
        this.loading = false;
        this.farmForm.enable();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(
          err,
          `Unable to load farm '${this.farmId}' for editing. Please refresh and try again.`
        );
        this.loading = false;
        this.farmForm.enable();
      },
    });
  }

  /**
   * Submits form data and routes to create or update handlers.
   */
  onSubmit(): void {
    if (this.farmForm.invalid) {
      this.farmForm.markAllAsTouched();
      return;
    }

    const payload = {
      farm_name: this.farmForm.controls.farm_name.value.trim(),
      crop_type: this.farmForm.controls.crop_type.value.trim(),
      address: {
        area_name: this.farmForm.controls.area_name.value.trim(),
      },
    };

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.farmForm.disable();

    if (this.isEditMode) {
      this.updateFarm(payload);
      return;
    }

    this.createFarm(payload);
  }

  /**
   * Creates a new farm record using the API POST endpoint.
   */
  createFarm(payload: {
    farm_name: string;
    crop_type: string;
    address: { area_name: string };
  }): void {
    this.apiService.createFarm(payload).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Farm created successfully.';
        this.notificationService.showSuccess(this.successMessage);
        this.submitting = false;
        this.farmForm.enable();
        const createdFarmId = response.farm_id;
        if (createdFarmId) {
          void this.router.navigate(['/farms', createdFarmId]);
          return;
        }
        void this.router.navigate(['/farms']);
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(
          err,
          'Unable to create the farm. Please correct the form fields and try again.'
        );
        this.notificationService.showError(this.errorMessage);
        this.submitting = false;
        this.farmForm.enable();
      },
    });
  }

  /**
   * Updates an existing farm record using the API PUT endpoint.
   */
  updateFarm(payload: {
    farm_name: string;
    crop_type: string;
    address: { area_name: string };
  }): void {
    this.apiService.updateFarm(this.farmId, payload).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Farm updated successfully.';
        this.notificationService.showSuccess(this.successMessage);
        this.submitting = false;
        this.farmForm.enable();
        void this.router.navigate(['/farms', this.farmId]);
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(
          err,
          `Unable to update farm '${this.farmId}'. Please review your changes and try again.`
        );
        this.notificationService.showError(this.errorMessage);
        this.submitting = false;
        this.farmForm.enable();
      },
    });
  }
}
