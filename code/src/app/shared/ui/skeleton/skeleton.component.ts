import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="shimmer-line" [class]="classes()"></div>
  `,
})
export class SkeletonComponent {
  width = input<string>('100%');
  height = input<string>('1rem');
  rounded = input<string>('rounded-lg');

  classes() {
    return `${this.rounded()}`;
  }
}

@Component({
  selector: 'app-message-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="card animate-pulse space-y-3">
      <div class="flex items-center gap-3">
        <div class="shimmer-line w-10 h-10 rounded-full flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="shimmer-line h-3 w-1/3 rounded"></div>
          <div class="shimmer-line h-2.5 w-1/4 rounded"></div>
        </div>
        <div class="shimmer-line h-2.5 w-16 rounded"></div>
      </div>
      <div class="shimmer-line h-4 rounded"></div>
      <div class="shimmer-line h-4 w-4/5 rounded"></div>
    </div>
  `,
})
export class MessageSkeletonComponent {}
