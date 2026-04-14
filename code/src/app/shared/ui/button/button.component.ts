import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [ngClass]="classes()"
      (click)="clicked.emit($event)">
      @if (loading()) {
        <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input<boolean>(false);
  clicked = output<MouseEvent>();

  classes(): Record<string, boolean> {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-gradient-to-r from-whisper-600 to-whisper-500 text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] hover:border-whisper-400 hover:text-whisper-600',
      ghost: 'text-[rgb(var(--color-muted))] hover:bg-whisper-50 dark:hover:bg-whisper-950/40 hover:text-whisper-600',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 hover:-translate-y-0.5 active:translate-y-0',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };
    return {
      [base]: true,
      [variants[this.variant()]]: true,
      [sizes[this.size()]]: true,
      'w-full': this.fullWidth(),
      'disabled:transform-none disabled:shadow-none': this.variant() === 'primary',
    };
  }
}
