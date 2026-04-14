import { Component, inject } from '@angular/core';
import { UiStore, Toast } from '../../stores/ui.store';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-80 max-w-[calc(100vw-2rem)]">
      @for (toast of uiStore.toasts(); track toast.id) {
        <div
          class="pointer-events-auto glass-card p-4 flex items-start gap-3 animate-toast-in shadow-glass"
          [ngClass]="borderClass(toast)">
          <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
               [ngClass]="iconBgClass(toast)">
            <svg class="w-4 h-4" [ngClass]="iconColorClass(toast)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              @if (toast.type === 'success') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              } @else if (toast.type === 'error') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              } @else if (toast.type === 'warning') {
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[rgb(var(--color-text))]">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-xs text-[rgb(var(--color-muted))] mt-0.5">{{ toast.message }}</p>
            }
          </div>
          <button (click)="uiStore.removeToast(toast.id)"
            class="flex-shrink-0 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  uiStore = inject(UiStore);

  borderClass(toast: Toast): string {
    const map: Record<string, string> = {
      success: 'border-l-4 border-l-emerald-400',
      error: 'border-l-4 border-l-rose-400',
      warning: 'border-l-4 border-l-amber-400',
      info: 'border-l-4 border-l-whisper-400',
    };
    return map[toast.type] || map['info'];
  }

  iconBgClass(toast: Toast): string {
    const map: Record<string, string> = {
      success: 'bg-emerald-100 dark:bg-emerald-900/40',
      error: 'bg-rose-100 dark:bg-rose-900/40',
      warning: 'bg-amber-100 dark:bg-amber-900/40',
      info: 'bg-whisper-100 dark:bg-whisper-900/40',
    };
    return map[toast.type] || map['info'];
  }

  iconColorClass(toast: Toast): string {
    const map: Record<string, string> = {
      success: 'text-emerald-600',
      error: 'text-rose-600',
      warning: 'text-amber-600',
      info: 'text-whisper-600',
    };
    return map[toast.type] || map['info'];
  }
}
