import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="flex items-center justify-center" [class]="containerClass()">
      <div
        class="border-2 border-whisper-200 border-t-whisper-600 rounded-full animate-spin"
        [class]="spinnerSize()">
      </div>
    </div>
  `,
})
export class LoaderComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  fullPage = input<boolean>(false);

  containerClass() {
    return this.fullPage() ? 'min-h-[60vh]' : 'py-8';
  }

  spinnerSize() {
    const map = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return map[this.size()];
  }
}
