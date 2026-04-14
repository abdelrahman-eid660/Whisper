import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginResponse } from '../../shared/models/api.model';
import { IConfirm, ILogin, IResetPassword, ISignup } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/auth`;
  // ── signup ──────────────────────────────────────────────────────────────────
  // Returns no tokens – only success message. Sends OTP email.
  signup(payload: ISignup): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/signup`, payload);
  }

  // ── email confirm ────────────────────────────────────────────────────────────
  confirmEmail(payload: IConfirm): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/confirm-email`, payload);
  }

  resendConfirmEmail(payload: { email: string }): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/resend-confirm-email`, payload);
  }

  // ── login ────────────────────────────────────────────────────────────────────
  // Returns either tokens (no 2FA) or string "OTP sent..." (2FA enabled)
  login(payload: ILogin): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.base}/login`, payload);
  }

  // ── 2FA login confirm ────────────────────────────────────────────────────────
  confirmLogin(payload: IConfirm): Observable<ApiResponse<AuthResponse>> {
    return this.http.patch<ApiResponse<AuthResponse>>(`${this.base}/login-confirm`, payload);
  }

  resendConfirmLogin(payload: { email: string }): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/resend-confirm-login`, payload);
  }

  // ── google auth ──────────────────────────────────────────────────────────────
  signupWithGmail(payload: { idToken: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/signup/gmail`, payload);
  }

  loginWithGmail(payload: { idToken: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/login/gmail`, payload);
  }

  // ── forget / reset password ──────────────────────────────────────────────────
  // Step 1 – sends OTP
  forgotPassword(payload: { email: string }): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/forget-password`, payload);
  }

  // Step 2 – verify OTP
  confirmForgotPassword(payload: IConfirm): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/confirm-forget-password`, payload);
  }

  // Step 3 – set new password
  resetPassword(payload: IResetPassword): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/reset-password`, payload);
  }
}
