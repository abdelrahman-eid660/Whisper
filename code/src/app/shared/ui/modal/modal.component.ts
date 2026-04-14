import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="onBackdrop()">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"></div>
        <div class="relative w-full max-w-md glass-card animate-scale-in" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
            <h2 class="font-display font-semibold text-lg text-[rgb(var(--color-text))]">{{ title() }}</h2>
            <button (click)="closed.emit()" class="btn-ghost p-1.5 rounded-lg">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Body -->
          <div class="p-6">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  open = input<boolean>(false);
  title = input<string>('');
  closeOnBackdrop = input<boolean>(true);
  closed = output<void>();

  onBackdrop(): void {
    if (this.closeOnBackdrop()) this.closed.emit();
  }
}
