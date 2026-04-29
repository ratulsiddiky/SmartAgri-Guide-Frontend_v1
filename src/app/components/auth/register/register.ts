import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly registerForm = new FormGroup(
    {
      username: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(32)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [passwordMatchValidator] }
  );

  loading = false;
  errorMessage = '';
  successMessage = '';
  verificationLink = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.verificationLink = '';

    this.authService
      .register({
        username: this.registerForm.controls.username.value.trim(),
        email: this.registerForm.controls.email.value.trim(),
        password: this.registerForm.controls.password.value,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = response.message || 'Registration successful. Please verify your email.';
          this.verificationLink = response.verification_link || '';
          this.registerForm.reset();
        },
        error: (err: unknown) => {
          this.loading = false;
          const errorPayload = err as { error?: { message?: string } };
          this.errorMessage =
            errorPayload.error?.message ||
            'Registration failed. Please review your details and try again.';
        },
      });
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}

