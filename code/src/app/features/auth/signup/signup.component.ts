import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiStore } from '../../../shared/stores/ui.store';
import { extractBackendError } from '../../../shared/models/api.model';
import { ISignup } from '../../../shared/models/auth.model';

// Strong password: uppercase + lowercase + number + special char, min 8
const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const PHONE_PATTERN = /^(02|2|\+20)?01[0-25]\d{8}$/;

function passwordMatchValidator(c: AbstractControl) {
  const pw = c.get('password')?.value;
  const cp = c.get('confirmPassword')?.value;
  return pw && cp && pw !== cp ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="glass-card p-8 space-y-6">
      <div class="text-center space-y-1">
        <h1 class="font-display text-2xl font-semibold text-[rgb(var(--color-text))]">Create account</h1>
        <p class="text-sm text-[rgb(var(--color-muted))]">Get your own anonymous message link</p>
      </div>

      @if (!sent()) {
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

          <!-- username -->
          <div>
            <label class="label">Username(*)</label>
            <input type="text" formControlName="userName" placeholder="yourname"
              class="input-base" [class.border-rose-400]="fc['userName'].invalid && fc['userName'].touched" />
            @if (fc['userName'].hasError('required') && fc['userName'].touched) {
              <p class="error-text">Username is required.</p>
            } @else if (fc['userName'].hasError('pattern') && fc['userName'].touched) {
              <p class="error-text">3–20 chars, letters, numbers and underscores only.</p>
            }
          </div>

          <!-- email -->
          <div>
            <label class="label">Email(*)</label>
            <input type="email" formControlName="email" placeholder="you@example.com"
              class="input-base" [class.border-rose-400]="fc['email'].invalid && fc['email'].touched" />
            @if (fc['email'].invalid && fc['email'].touched) {
              <p class="error-text">Please enter a valid email.</p>
            }
          </div>

          <!-- password -->
          <div>
            <label class="label">Password(*)</label>
            <div class="relative">
              <input [type]="showPw() ? 'text' : 'password'" formControlName="password"
                placeholder="Min 8, uppercase, number, symbol"
                class="input-base pr-10"
                [class.border-rose-400]="fc['password'].invalid && fc['password'].touched" />
              <button type="button" (click)="showPw.set(!showPw())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            @if (fc['password'].hasError('required') && fc['password'].touched) {
              <p class="error-text">Password is required.</p>
            } @else if (fc['password'].hasError('pattern') && fc['password'].touched) {
              <p class="error-text">Must have uppercase, lowercase, number and special character.</p>
            }
          </div>

          <!-- confirm password -->
          <div>
            <label class="label">Confirm Password(*)</label>
            <input type="password" formControlName="confirmPassword" placeholder="Repeat password"
              class="input-base"
              [class.border-rose-400]="(form.hasError('passwordMismatch') && fc['confirmPassword'].touched) || (fc['confirmPassword'].invalid && fc['confirmPassword'].touched)" />
            @if (form.hasError('passwordMismatch') && fc['confirmPassword'].touched) {
              <p class="error-text">Passwords do not match.</p>
            }
          </div>

        <!-- phone -->
          <div>
            <label class="label">phone</label>
            <input type="text" formControlName="phone" placeholder="your phone"
              class="input-base" [class.border-rose-400]="fc['phone'].invalid && fc['phone'].touched" />
              @if (fc['phone'].hasError('pattern') && fc['phone'].touched) {
              <p class="error-text">02|01|020 +  your number</p>
            }
          </div>
        <!-- DOB -->
          <div>
            <label class="label">DOB</label>
            <input type="date" formControlName="DOB" placeholder="Your DOB"
              class="input-base" [class.border-rose-400]="fc['DOB'].invalid && fc['DOB'].touched" />
          </div>
        <!-- Gender -->
          <div>
            <label class="label" for="gender">Gender</label>
            <select name="gender" id="gender" formControlName="gender" class="input-base" [class.border-rose-400]="fc['gender'].invalid && fc['gender'].touched" >
              <option value="" selected disabled>Choose your gender</option>
              <option value="Male">Male</option>
              <option value=" Female">Female</option>
            </select>
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
            Create account
          </button>
        </form>
      } @else {
        <!-- success state – redirect handled in TS -->
        <div class="text-center space-y-4 py-4">
          <div class="w-16 h-16 mx-auto rounded-full bg-whisper-100 dark:bg-whisper-900/40 flex items-center justify-center">
            <svg class="w-8 h-8 text-whisper-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-[rgb(var(--color-text))]">Check your inbox!</p>
            <p class="text-sm text-[rgb(var(--color-muted))] mt-1">
              We sent a 6-digit OTP to <strong>{{ form.value.email }}</strong>
            </p>
          </div>
        </div>
      }

      @if (!sent()) {
        <p class="text-center text-sm text-[rgb(var(--color-muted))]">
          Already have an account?
          <a routerLink="/auth/login" class="link ml-1">Sign in</a>
        </p>
      }
    </div>
  `,
})
export class SignupComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private uiStore     = inject(UiStore);
  private router      = inject(Router);

  form = this.fb.group({
  userName:        ['', [Validators.required, Validators.pattern(USERNAME_PATTERN)]],
  email:           ['', [Validators.required, Validators.email]],
  password:        ['', [Validators.required, Validators.pattern(STRONG_PW)]],
  confirmPassword: ['', Validators.required],
  phone:           ['', [Validators.pattern(PHONE_PATTERN)]],
  gender:           ['male'],
  DOB:           [''],
}, {
  validators: [passwordMatchValidator] // 👈 لازم array
});

  loading = signal(false);
  error   = signal('');
  sent    = signal(false);
  showPw  = signal(false);

  get fc() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    this.authService.signup(this.form.value as ISignup).subscribe({
      next: (res) => {
        this.sent.set(true);        
        // Navigate to OTP confirm page
        setTimeout(() => {
          this.router.navigate(['/auth/confirm-email'], {
            queryParams: { email: this.form.get('email')?.value }
          });
        }, 1200);
      },
      error: err => {        
        this.error.set(extractBackendError(err));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
