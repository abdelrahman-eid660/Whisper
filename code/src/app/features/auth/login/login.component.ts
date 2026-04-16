import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../shared/stores/auth.store';
import { UiStore } from '../../../shared/stores/ui.store';
import { extractBackendError, AuthResponse } from '../../../shared/models/api.model';
import { GoogleService } from '../../../core/services/google.service';
import { ILogin } from '../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="glass-card p-8 space-y-6">
      <div class="text-center space-y-1">
        <h1 class="font-display text-2xl font-semibold text-[rgb(var(--color-text))]">Welcome back</h1>
        <p class="text-sm text-[rgb(var(--color-muted))]">Sign in to read your anonymous messages</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <!-- email -->
        <div>
          <label class="label" for="email">Email</label>
          <input type="email" id="email" formControlName="email" placeholder="you@example.com"
            class="input-base" [class.border-rose-400]="fc['email'].invalid && fc['email'].touched" />
          @if (fc['email'].invalid && fc['email'].touched) {
            <p class="error-text">Please enter a valid email.</p>
          }
        </div>

        <!-- password -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="label !mb-0" for="password">Password</label>
            <a routerLink="/auth/forgot-password" class="text-xs link">Forgot password?</a>
          </div>
          <div class="relative">
            <input id="password" [type]="showPw() ? 'text' : 'password'" formControlName="password"
              placeholder="••••••••" class="input-base pr-10"
              [class.border-rose-400]="fc['password'].invalid && fc['password'].touched" />
            <button type="button" (click)="showPw.set(!showPw())"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                @if (showPw()) {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                }
              </svg>
            </button>
          </div>
          @if (fc['password'].invalid && fc['password'].touched) {
            <p class="error-text">Password is required.</p>
          }
        </div>

        <!-- global error -->
        @if (error()) {
          <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p class="text-sm text-rose-600 dark:text-rose-400">{{ error() }}</p>
          </div>
        }

        <button type="submit" [disabled]="loading() || form.invalid" class="btn-primary w-full">
          @if (loading()) {
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          }
          Sign in
        </button>
        <div id="googleBtn" class="flex justify-center"></div>
      </form>

      <!-- divider -->
      <div class="relative flex items-center gap-3">
        <div class="flex-1 h-px bg-[rgb(var(--color-border))]"></div>
        <span class="text-xs text-[rgb(var(--color-muted))]">or</span>
        <div class="flex-1 h-px bg-[rgb(var(--color-border))]"></div>
      </div>

      <p class="text-center text-sm text-[rgb(var(--color-muted))]">
        Don't have an account?
        <a routerLink="/auth/signup" class="link ml-1">Sign up</a>
      </p>
    </div>
  `,
})
export class LoginComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private google = inject(GoogleService);
  private authStore   = inject(AuthStore);
  private uiStore     = inject(UiStore);
  private router      = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
ngOnInit() {
  this.google.init(
    '371091382213-c0uq0hrmc7pcqmqkk8r8gvtsed2bcfan.apps.googleusercontent.com',
    (token) => this.handleGoogle(token)
  );
}
handleGoogle(token: string) {
  this.loading.set(true);

  this.authService.signupWithGmail({ idToken: token }).subscribe({
    next: (res) => {      
      const data = res.data?.data;
      if(!data)return
      this.authStore.setAuth(
        data.user,
        data.access_Token,
        data.refreash_Token
      );
      this.uiStore.success('Welcome!', 'Account created successfully');
      this.router.navigate(['/messages']);
      this.loading.set(false);
    },
    error: (err) => {
      this.error.set('Google login failed');
      this.loading.set(false);
    }
  });
}
  loading = signal(false);
  error   = signal('');
  showPw  = signal(false);

  get fc() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    this.authService.login(this.form.value as ILogin).subscribe({
      next: res => {        
        const payload = res.data;

        // ── Case 1: 2FA enabled → backend returns a plain string ──────────
        if (typeof payload === 'string') {
          this.uiStore.info('OTP Sent', 'Check your email for the login code.');
          this.router.navigate(['/auth/confirm-login'], {
            queryParams: { email: this.form.get('email')?.value }
          });
          this.loading.set(false);
          return;
        }

        // ── Case 2: Normal login → tokens returned ────────────────────────
        const tokens = payload as AuthResponse;
        if (tokens?.access_Token && tokens?.refreash_Token) {
          this.authStore.setAuth(
            tokens.user,
            tokens.access_Token,
            tokens.refreash_Token
          );
          this.uiStore.success('Welcome back!',
            `Hello, ${tokens.user.userName}`);
          this.router.navigate(['/messages']);
        }
        this.loading.set(false);
      },
      error: err => {        
        this.error.set(extractBackendError(err.errorMessage));
        this.loading.set(false);
      },
    });
  }
}
