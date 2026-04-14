import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiStore } from '../../../shared/stores/ui.store';
import { extractBackendError } from '../../../shared/models/api.model';

const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function passwordMatch(c: AbstractControl) {
  const pw = c.get('password')?.value;
  const cp = c.get('confirmPassword')?.value;
  return pw && cp && pw !== cp ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="glass-card p-8 space-y-6">
      <div class="text-center space-y-1">
        <h1 class="font-display text-2xl font-semibold text-[rgb(var(--color-text))]">New password</h1>
        <p class="text-sm text-[rgb(var(--color-muted))]">Choose a strong password for your account.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="label">New Password</label>
          <div class="relative">
            <input [type]="showPw() ? 'text' : 'password'" formControlName="password"
              placeholder="Min 8, uppercase, number, symbol"
              class="input-base pr-10"
              [class.border-rose-400]="form.controls['password'].invalid && form.controls['password'].touched" />
            <button type="button" (click)="showPw.set(!showPw())"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          @if (form.controls['password'].hasError('required') && form.controls['password'].touched) {
            <p class="error-text">Password is required.</p>
          } @else if (form.controls['password'].hasError('pattern') && form.controls['password'].touched) {
            <p class="error-text">Must include uppercase, lowercase, number and special character.</p>
          }
        </div>

        <div>
          <label class="label">Confirm Password</label>
          <input type="password" formControlName="confirmPassword" placeholder="Repeat password"
            class="input-base"
            [class.border-rose-400]="form.hasError('passwordMismatch') && form.controls['confirmPassword'].touched" />
          @if (form.hasError('passwordMismatch') && form.controls['confirmPassword'].touched) {
            <p class="error-text">Passwords do not match.</p>
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
          Set new password
        </button>
      </form>

      <p class="text-center text-sm">
        <a routerLink="/auth/login" class="link text-[rgb(var(--color-muted))]">← Back to login</a>
      </p>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private route       = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private uiStore     = inject(UiStore);
  private router      = inject(Router);

  private email = '';

  form = this.fb.group({
    password:        ['', [Validators.required, Validators.pattern(STRONG_PW)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  loading = signal(false);
  error   = signal('');
  showPw  = signal(false);

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  submit(): void {
    if (this.form.invalid || !this.email) return;
    this.loading.set(true);
    this.error.set('');

    const { password, confirmPassword } = this.form.value;
    this.authService.resetPassword({
      email: this.email,
      password: password!,
      confirmPassword: confirmPassword!,
    }).subscribe({
      next: () => {
        this.uiStore.success('Password reset!', 'You can now sign in with your new password.');
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.error.set(extractBackendError(err));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
