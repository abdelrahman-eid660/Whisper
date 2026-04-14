import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, TokenData } from '../../shared/models/api.model';
import { User, PublicUser, IEditProfile, IUpdatePassword } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/profile`;

  getProfile(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.base}/${id}`);
  }

  getPublicProfile(id: string): Observable<ApiResponse<PublicUser>> {
    return this.http.get<ApiResponse<PublicUser>>(`${this.base}/${id}`);
  }

  updatePassword(payload: IUpdatePassword): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/update-password`, payload);
  }

  updateProfilePicture(formData: FormData): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.base}/profile-picture`, formData);
  }

  updateCoverPicture(formData: FormData): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.base}/profile-cover-picture`, formData);
  }

  updateAccount(id: string , payload : IEditProfile): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${id}` , payload);
  }
  deleteAccount(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/logout`, {});
  }

  /** Rotate – returns new tokens.
   *  The interceptor calls this with the refresh token in the header. */
  rotateToken(): Observable<ApiResponse<TokenData>> {
    return this.http.get<ApiResponse<TokenData>>(`${this.base}/rotate`);
  }

  // 2FA - uses exact backend URL spelling (typo included)
  enable2FA(): Observable<ApiResponse<{ qrCode?: string; message?: string }>> {
    return this.http.patch<ApiResponse<{ qrCode?: string; message?: string }>>(
      `${this.base}/enable-2Step-veverification`, {}
    );
  }

  confirm2FA(payload: { OTP: string }): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.base}/confirm-2Step-veverification`, payload
    );
  }
}
