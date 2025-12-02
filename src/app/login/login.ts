import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div class="card shadow-sm" style="max-width: 400px; width: 100%;">
        <div class="card-body">
          <h2 class="card-title mb-4 text-center">Login</h2>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
           
            <div class="mb-3">
              <label class="form-label" for="username">Username</label>
              <input
                id="username"
                type="text"
                class="form-control"
                formControlName="username"
                [class.is-invalid]="
                  loginForm.controls.username.invalid && loginForm.controls.username.touched
                "
              />
              @if ( loginForm.controls.username.invalid && loginForm.controls.username.touched ) {
              <div class="invalid-feedback">Username is required</div>
              }
            </div>

          
            <div class="mb-3">
              <label class="form-label" for="password">Password</label>
              <input
                id="password"
                type="password"
                class="form-control"
                formControlName="password"
                [class.is-invalid]="
                  loginForm.controls.password.invalid && loginForm.controls.password.touched
                "
              />
              @if ( loginForm.controls.password.invalid && loginForm.controls.password.touched ) {
              <div class="invalid-feedback">Password is required</div>
              }
            </div>

            
            @if (errorMessage) {
            <div class="alert alert-danger py-2">
              {{ errorMessage }}
            </div>
            }

            
            <button
              type="submit"
              class="btn btn-primary w-100 mt-2"
              [disabled]="loginForm.invalid || loading"
            >
              @if (loading) {
              <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              }
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>

            
            <p class="text-center mt-3 mb-0">
              <small>
                Don't have an account?
                <a routerLink="/register" class="link-primary">Register here</a>
              </small>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  loginForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.getRawValue();

    this.auth.login(username!, password!).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/users', res.userId, 'books']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Invalid login';
      },
    });
  }
}
