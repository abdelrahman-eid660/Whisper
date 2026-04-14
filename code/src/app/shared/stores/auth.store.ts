import { Injectable, signal, computed, effect } from '@angular/core';
import { User } from '../models/user.model';

export const ACCESS_TOKEN_KEY  = 'access_Token';
export const REFRESH_TOKEN_KEY = 'refreash_Token';   // keep backend typo exactly
export const USER_KEY          = 'whisper_user';

@Injectable({ providedIn: 'root' })
export class AuthStore {

  private _user         = signal<User | null>(this._loadUser());
  private _accessToken  = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  private _refreshToken = signal<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
  private _loading      = signal<boolean>(false);

  readonly user         = this._user.asReadonly();
  readonly accessToken  = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly loading      = this._loading.asReadonly();

  readonly isLoggedIn = computed(() => !!this._accessToken() && !!this._user());

  readonly profileUrl = computed(() => {
    const u = this._user();
    return u ? `/p/${u.userName}` : null;
  });

  constructor() {
    effect(() => {
      const t = this._accessToken();
      t ? localStorage.setItem(ACCESS_TOKEN_KEY, t) : localStorage.removeItem(ACCESS_TOKEN_KEY);
    });
    effect(() => {
      const t = this._refreshToken();
      t ? localStorage.setItem(REFRESH_TOKEN_KEY, t) : localStorage.removeItem(REFRESH_TOKEN_KEY);
    });
    effect(() => {
      const u = this._user();
      u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY);
    });
  }

  setAuth(user: User, accessToken: string, refreshToken: string): void {
    this._user.set(user);
    this._accessToken.set(accessToken);
    this._refreshToken.set(refreshToken);
  }

  setUser(user: User): void { this._user.set(user); }

  setAccessToken(token: string): void { this._accessToken.set(token); }

  setLoading(val: boolean): void { this._loading.set(val); }

  clear(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._loading.set(false);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private _loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
