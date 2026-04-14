import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthStore } from '../../../shared/stores/auth.store';
import { UiStore } from '../../../shared/stores/ui.store';
import { OtpInputComponent } from '../../../shared/ui/otp-input/otp-input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { extractBackendError } from '../../../shared/models/api.model';
import { Router } from '@angular/router';
import { IUpdatePassword } from '../../../shared/models/user.model';

const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const RESEND_SECONDS = 60;

function passwordMatch(c: AbstractControl) {
  const pw = c.get('password')?.value;
  const cp = c.get('confirmPassword')?.value;
  return pw && cp && pw !== cp ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [ReactiveFormsModule, OtpInputComponent, ModalComponent],
  template: `
    <div class="page-container max-w-2xl">
      <div class="mb-8">
        <h1 class="section-title">Security</h1>
        <p class="text-sm text-[rgb(var(--color-muted))] mt-1">Manage your password and two-factor authentication</p>
      </div>

      <div class="space-y-4 animate-fade-in">

        <!-- ── Change Password ─────────────────────────────────────────── -->
        <div class="card space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-whisper-100 dark:bg-whisper-900/40 flex items-center justify-center">
              <svg class="w-5 h-5 text-whisper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 class="font-semibold text-sm">Change Password</h2>
              <p class="text-xs text-[rgb(var(--color-muted))]">Update your account password</p>
            </div>
          </div>

          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
            <div>
              <label class="label">Old Password</label>
              <div class="relative">
                <input [type]="showPw() ? 'text' : 'password'" formControlName="oldPassword"
                  placeholder="Enter your current password"
                  class="input-base pr-10"
                  [class.border-rose-400]="passwordForm.controls['oldPassword'].invalid && passwordForm.controls['oldPassword'].touched" />
                <button type="button" (click)="showPw.set(!showPw())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              @if (passwordForm.controls['oldPassword'].hasError('pattern') && passwordForm.controls['oldPassword'].touched) {
                <p class="error-text">Must include uppercase, lowercase, number and special character.</p>
              }
            </div>
            <div>
              <label class="label">New Password</label>
              <div class="relative">
                <input [type]="showPw() ? 'text' : 'password'" formControlName="newPassword"
                  placeholder="Min 8, uppercase, number, symbol"
                  class="input-base pr-10"
                  [class.border-rose-400]="passwordForm.controls['newPassword'].invalid && passwordForm.controls['newPassword'].touched" />
                <button type="button" (click)="showPw.set(!showPw())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              @if (passwordForm.controls['newPassword'].hasError('pattern') && passwordForm.controls['newPassword'].touched) {
                <p class="error-text">Must include uppercase, lowercase, number and special character.</p>
              }
            </div>

            <div>
              <label class="label">Confirm Password</label>
              <input type="password" formControlName="confirmPassword" placeholder="Repeat password"
                class="input-base"
                [class.border-rose-400]="passwordForm.hasError('passwordMismatch') && passwordForm.controls['confirmPassword'].touched" />
              @if (passwordForm.hasError('passwordMismatch') && passwordForm.controls['confirmPassword'].touched) {
                <p class="error-text">Passwords do not match.</p>
              }
            </div>

            <button type="submit" [disabled]="changingPw() || passwordForm.invalid" class="btn-primary">
              @if (changingPw()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> }
              Update password
            </button>
          </form>
        </div>

        <!-- ── 2FA ──────────────────────────────────────────────────────── -->
        <div class="card space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-whisper-100 dark:bg-whisper-900/40 flex items-center justify-center">
              <svg class="w-5 h-5 text-whisper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="font-semibold text-sm">Two-Factor Authentication</h2>
              <p class="text-xs text-[rgb(var(--color-muted))]">Extra security for your account</p>
            </div>
            @if (authStore.user()?.twoStepVerification) {
              <span class="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Enabled
              </span>
            } @else {
              <span class="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Disabled</span>
            }
          </div>

          @if (!authStore.user()?.twoStepVerification) {
            <p class="text-sm text-[rgb(var(--color-muted))] leading-relaxed">
              2FA adds a verification code step when you log in, sent to your email.
            </p>
            <button (click)="enable2FA()" [disabled]="enabling2FA()" class="btn-primary">
              @if (enabling2FA()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> }
              Enable 2FA
            </button>
          } @else {
            <div class="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p class="text-sm text-emerald-700 dark:text-emerald-400">
                Two-factor authentication is active. Your account is protected.
              </p>
            </div>
          }
        </div>

        <!-- ── Danger zone ──────────────────────────────────────────────── -->
        <div class="card border-rose-200 dark:border-rose-900/60 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 class="font-semibold text-sm text-rose-600">Danger Zone</h2>
              <p class="text-xs text-[rgb(var(--color-muted))]">Irreversible actions</p>
            </div>
          </div>
          <p class="text-sm text-[rgb(var(--color-muted))]">
            Deleting your account permanently removes all your data and messages. This cannot be undone.
          </p>
          <button (click)="showDeleteModal.set(true)"
            class="px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            Delete my account
          </button>
        </div>
      </div>
    </div>

    <!-- 2FA confirm modal -->
    <app-modal [open]="show2FAModal()" title="Set up Two-Factor Auth" (closed)="show2FAModal.set(false)">
      <div class="space-y-5">
        <p class="text-sm text-[rgb(var(--color-muted))]">
          An OTP has been sent to your email. Enter it below to activate 2FA.
        </p>

        <app-otp-input #otpRef (otpChange)="otpValue.set($event)" />

        <!-- resend inside modal -->
        <div class="text-center">
          @if (otpCountdown() > 0) {
            <p class="text-xs text-[rgb(var(--color-muted))]">
              Resend in <span class="font-mono font-semibold text-whisper-600">{{ otpCountdown() }}s</span>
            </p>
          } @else {
            <button (click)="resend2FA()" [disabled]="resending2FA()" class="text-xs link font-medium">
              @if (resending2FA()) { Sending... } @else { Resend code }
            </button>
          }
        </div>

        <button (click)="confirm2FA()" [disabled]="otpValue().length < 6 || confirming2FA()" class="btn-primary w-full">
          @if (confirming2FA()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> }
          Verify & Enable
        </button>
      </div>
    </app-modal>

    <!-- delete confirm modal -->
    <app-modal [open]="showDeleteModal()" title="Delete account" (closed)="showDeleteModal.set(false)">
      <div class="space-y-4">
        <p class="text-sm text-[rgb(var(--color-muted))]">
          Are you absolutely sure? All data will be permanently deleted.
        </p>
        <div class="flex gap-3">
          <button (click)="showDeleteModal.set(false)" class="btn-secondary flex-1">Cancel</button>
          <button (click)="deleteAccount()" [disabled]="deletingAccount()"
            class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-50">
            @if (deletingAccount()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> }
            Delete forever
          </button>
        </div>
      </div>
    </app-modal>
  `,
})
export class SecurityComponent implements OnDestroy {
  authStore   = inject(AuthStore);
  private userService = inject(UserService);
  private uiStore     = inject(UiStore);
  private fb          = inject(FormBuilder);
  private router      = inject(Router);

  passwordForm = this.fb.group({
    oldPassword:        ['', [Validators.required, Validators.pattern(STRONG_PW)]],
    newPassword:        ['', [Validators.required, Validators.pattern(STRONG_PW)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  changingPw    = signal(false);
  showPw        = signal(false);
  enabling2FA   = signal(false);
  show2FAModal  = signal(false);
  otpValue      = signal('');
  confirming2FA = signal(false);
  resending2FA  = signal(false);
  otpCountdown  = signal(0);
  showDeleteModal  = signal(false);
  deletingAccount  = signal(false);

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void { this._clearTimer(); }

  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.changingPw.set(true);
    this.userService.updatePassword(this.passwordForm.value as IUpdatePassword).subscribe({
      next: () => {
        this.uiStore.success('Password updated!');
        this.passwordForm.reset();
        this.changingPw.set(false);
      },
      error: err => {
        this.uiStore.error('Failed', extractBackendError(err));
        this.changingPw.set(false);
      },
    });
  }

  enable2FA(): void {
    this.enabling2FA.set(true);
    this.userService.enable2FA().subscribe({
      next: () => {
        this.show2FAModal.set(true);
        this._startOtpCountdown();
        this.enabling2FA.set(false);
      },
      error: err => {
        this.uiStore.error('Failed', extractBackendError(err));
        this.enabling2FA.set(false);
      },
    });
  }

  confirm2FA(): void {
    if (this.otpValue().length < 6) return;
    this.confirming2FA.set(true);
    this.userService.confirm2FA({ OTP: this.otpValue() }).subscribe({
      next: () => {
        const user = this.authStore.user();
        if (user) this.authStore.setUser({ ...user, twoStepVerification: true });
        this.uiStore.success('2FA enabled!', 'Your account is now more secure.');
        this.show2FAModal.set(false);
        this._clearTimer();
        this.confirming2FA.set(false);
      },
      error: err => {
        this.uiStore.error('Invalid code', extractBackendError(err));
        this.confirming2FA.set(false);
      },
    });
  }

  resend2FA(): void {
    this.resending2FA.set(true);
    this.userService.enable2FA().subscribe({
      next: () => {
        this.uiStore.success('Code resent!', 'Check your email.');
        this._startOtpCountdown();
        this.resending2FA.set(false);
      },
      error: () => this.resending2FA.set(false),
    });
  }

  deleteAccount(): void {
    const id = this.authStore.user()?._id;
    if (!id) return;
    this.deletingAccount.set(true);
    this.userService.deleteAccount(id).subscribe({
      next: () => {
        this.authStore.clear();
        this.router.navigate(['/auth/signup']);
      },
      error: () => this.deletingAccount.set(false),
    });
  }

  private _startOtpCountdown(): void {
    this._clearTimer();
    this.otpCountdown.set(RESEND_SECONDS);
    this.timer = setInterval(() => {
      this.otpCountdown.update(v => {
        if (v <= 1) { this._clearTimer(); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  private _clearTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}
