import { Injectable, signal, computed, effect } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const DARK_MODE_KEY = 'whisper_dark_mode';

@Injectable({ providedIn: 'root' })
export class UiStore {
  private _darkMode = signal<boolean>(
    localStorage.getItem(DARK_MODE_KEY) === 'true' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  private _globalLoading = signal<boolean>(false);
  private _toasts = signal<Toast[]>([]);

  readonly darkMode = this._darkMode.asReadonly();
  readonly globalLoading = this._globalLoading.asReadonly();
  readonly toasts = this._toasts.asReadonly();
  readonly hasToasts = computed(() => this._toasts().length > 0);

  constructor() {
    effect(() => {
      const dark = this._darkMode();
      localStorage.setItem(DARK_MODE_KEY, String(dark));
      if (dark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    });

    // Apply initial dark mode
    if (this._darkMode()) document.documentElement.classList.add('dark');
  }

  toggleDarkMode(): void {
    this._darkMode.update(v => !v);
  }

  setDarkMode(val: boolean): void {
    this._darkMode.set(val);
  }

  setGlobalLoading(val: boolean): void {
    this._globalLoading.set(val);
  }

  toast(type: ToastType, title: string, message?: string, duration = 4000): void {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, title, message, duration };
    this._toasts.update(t => [...t, toast]);
    setTimeout(() => this.removeToast(id), duration);
  }

  removeToast(id: string): void {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }

  success(title: string, message?: string): void {
    this.toast('success', title, message);
  }

  error(title: string, message?: string): void {
    this.toast('error', title, message);
  }

  info(title: string, message?: string): void {
    this.toast('info', title, message);
  }

  warning(title: string, message?: string): void {
    this.toast('warning', title, message);
  }
}
