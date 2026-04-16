import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiStore } from '../../../shared/stores/ui.store';
import { extractBackendError } from '../../../shared/models/api.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="glass-card p-8 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-whisper-100 dark:bg-whisper-900/40 flex items-center justify-center">
          <svg class="w-7 h-7 text-whisper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 class="font-display text-2xl font-semibold text-[rgb(var(--color-text))]">Forgot password?</h1>
        <p class="text-sm text-[rgb(var(--color-muted))]">Enter your email and we'll send you a reset code.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="label" for="email">Email</label>
          <input type="email" id="email" formControlName="email" placeholder="you@example.com"
            class="input-base" [class.border-rose-400]="form.controls['email'].invalid && form.controls['email'].touched" />
          @if (form.controls['email'].invalid && form.controls['email'].touched) {
            <p class="error-text">Please enter a valid email.</p>
          }
        </div>

        @if (error()) {
          <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p class="text-sm text-rose-600 dark:text-rose-400">{{ error() }}</p>
          </div>
        }

        <button type="submit" [disabled]="loading() || form.invalid" class="btn-primary w-full">
          @if (loading()) {
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          }
          Send reset code
        </button>
      </form>

      <p class="text-center text-sm">
        <a routerLink="/auth/login" class="link text-[rgb(var(--color-muted))]">← Back to login</a>
      </p>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private uiStore     = inject(UiStore);
  private router      = inject(Router);

  form    = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading = signal(false);
  error   = signal('');

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const email = this.form.value.email!;
    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.uiStore.info('Code sent!', `Check your inbox at ${email}`);
        this.router.navigate(['/auth/confirm-forgot'], { queryParams: { email } });
        this.loading.set(false);
      },
      error: err => {
        this.error.set(extractBackendError(err));
        this.loading.set(false);
      },
    });
  }
}
