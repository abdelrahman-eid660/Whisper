import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiStore } from '../../../shared/stores/ui.store';
import { OtpInputComponent } from '../../../shared/ui/otp-input/otp-input.component';
import { extractBackendError } from '../../../shared/models/api.model';

const RESEND_SECONDS = 60;

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink, OtpInputComponent],
  template: `
    <div class="glass-card p-8 space-y-6">
      <!-- header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-whisper-100 dark:bg-whisper-900/40 flex items-center justify-center">
          <svg class="w-7 h-7 text-whisper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="font-display text-2xl font-semibold text-[rgb(var(--color-text))]">Verify your email</h1>
        <p class="text-sm text-[rgb(var(--color-muted))]">
          Enter the 6-digit code sent to<br/>
          <span class="font-medium text-[rgb(var(--color-text))]">{{ email() }}</span>
        </p>
      </div>

      <!-- OTP input -->
      <app-otp-input (otpChange)="otp.set($event)" />

      <!-- error -->
      @if (error()) {
        <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
          <p class="text-sm text-rose-600 dark:text-rose-400">{{ error() }}</p>
        </div>
      }

      <!-- confirm button -->
      <button (click)="confirm()" [disabled]="otp().length < 6 || loading()" class="btn-primary w-full">
        @if (loading()) {
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        }
        Confirm email
      </button>

      <!-- resend -->
      <div class="text-center">
        @if (countdown() > 0) {
          <p class="text-sm text-[rgb(var(--color-muted))]">
            Resend code in
            <span class="font-mono font-semibold text-whisper-600">{{ countdown() }}s</span>
          </p>
        } @else {
          <button (click)="resend()" [disabled]="resending()"
            class="text-sm link font-medium">
            @if (resending()) { Sending... } @else { Resend code }
          </button>
        }
      </div>

      <p class="text-center text-sm">
        <a routerLink="/auth/login" class="link text-[rgb(var(--color-muted))]">← Back to login</a>
      </p>
    </div>
  `,
})
export class ConfirmEmailComponent implements OnInit, OnDestroy {
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private authService = inject(AuthService);
  private uiStore     = inject(UiStore);

  email     = signal('');
  otp       = signal('');
  loading   = signal(false);
  resending = signal(false);
  error     = signal('');
  countdown = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const e = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.email.set(e);
    this._startCountdown();
  }

  ngOnDestroy(): void { this._clearTimer(); }

  confirm(): void {
    if (this.otp().length < 6) return;
    this.loading.set(true);
    this.error.set(''); 

    this.authService.confirmEmail({ email: this.email(), otp: this.otp() }).subscribe({
      next: () => {
        this.uiStore.success('Email confirmed!', 'You can now sign in.');
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.error.set(extractBackendError(err));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  resend(): void {
    if (!this.email()) return;
    this.resending.set(true);
    this.authService.resendConfirmEmail({ email: this.email() }).subscribe({
      next: () => {
        this.uiStore.success('Code sent!', 'Check your email.');
        this._startCountdown();
        this.resending.set(false);
      },
      error: err => {
        this.uiStore.error('Could not resend', extractBackendError(err));
        this.resending.set(false);
      },
    });
  }

  private _startCountdown(): void {
    this._clearTimer();
    this.countdown.set(RESEND_SECONDS);
    this.timer = setInterval(() => {
      this.countdown.update(v => {
        if (v <= 1) { this._clearTimer(); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  private _clearTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}
