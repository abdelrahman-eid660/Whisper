import { Component, inject } from '@angular/core';
import { UiStore } from '../../stores/ui.store';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  template: `
    @if (uiStore.globalLoading()) {
      <div class="fixed inset-0 z-[9998] bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div class="glass-card p-6 flex items-center gap-4">
          <div class="w-8 h-8 border-2 border-whisper-200 border-t-whisper-600 rounded-full animate-spin"></div>
          <span class="text-sm font-medium text-[rgb(var(--color-text))]">Loading...</span>
        </div>
      </div>
    }
  `,
})
export class GlobalLoaderComponent {
  uiStore = inject(UiStore);
}
