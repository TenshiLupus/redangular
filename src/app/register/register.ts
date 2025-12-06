import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-body">
      <div class="card shadow-sm" style="max-width: 420px; width: 100%;">
        <div class="card-body">
          <h2 class="card-title mb-4 text-center">Register</h2>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                type="text"
                class="form-control"
                formControlName="username"
                [class.is-invalid]="
                  registerForm.controls.username.invalid && registerForm.controls.username.touched
                "
              />

              @if ( registerForm.controls.username.invalid && registerForm.controls.username.touched
              ) {
              <div class="invalid-feedback">Username is required</div>
              }
            </div>

            
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                type="password"
                class="form-control"
                formControlName="password"
                [class.is-invalid]="
                  registerForm.controls.password.invalid && registerForm.controls.password.touched
                "
              />

              @if ( registerForm.controls.password.invalid && registerForm.controls.password.touched
              ) {
              <div class="invalid-feedback">Password is required (min 6 characters)</div>
              }
            </div>

            
            <div class="mb-3">
              <label for="confirmPassword" class="form-label"> Confirm Password </label>
              <input
                id="confirmPassword"
                type="password"
                class="form-control"
                formControlName="confirmPassword"
                [class.is-invalid]="
                  (registerForm.controls.confirmPassword.invalid &&
                    registerForm.controls.confirmPassword.touched) ||
                  (passwordsDoNotMatch && registerForm.controls.confirmPassword.touched)
                "
              />

              @if ( registerForm.controls.confirmPassword.invalid &&
              registerForm.controls.confirmPassword.touched ) {
              <div class="invalid-feedback">Please confirm your password</div>
              } @else if ( passwordsDoNotMatch && registerForm.controls.confirmPassword.touched ) {
              <div class="invalid-feedback">Passwords do not match</div>
              }
            </div>

            
            <button
              type="submit"
              class="btn btn-primary w-100"
              [disabled]="registerForm.invalid || passwordsDoNotMatch || loading"
            >
              @if (loading) {
              <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              }
              {{ loading ? 'Creating account…' : 'Register' }}
            </button>

         
            @if (errorMessage) {
            <div class="alert alert-danger mt-3 mb-0">
              {{ errorMessage }}
            </div>
            } @if (successMessage) {
            <div class="alert alert-success mt-3 mb-0">
              {{ successMessage }}
            </div>
            }
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrl: './register.css',
})
export class RegisterComponent {
  private auth = inject<AuthService>(AuthService);
  private router = inject<Router>(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';

  registerForm = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get passwordsDoNotMatch(): boolean {
    const { password, confirmPassword } = this.registerForm.getRawValue();
    return password !== confirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordsDoNotMatch) {
      this.registerForm.markAllAsTouched();
      return;
    }

    //reset mesagge if there was a previous one
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, password } = this.registerForm.getRawValue();

    this.auth.register(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Account created! Redirecting…';
        setTimeout(() => this.router.navigate(['/login']), 800);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;

        const backendError = (err.error as any)?.message ?? err.error ?? err.message;

        this.errorMessage = backendError || 'Registration failed. Please try again.';
      },
    });
  }
}
