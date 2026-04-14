import { Component, input, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }],
  template: `
    <div class="space-y-1.5">
      @if (label()) {
        <label class="label">{{ label() }}</label>
      }
      <div class="relative">
        @if (prefix()) {
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))]">
            <ng-content select="[prefix]" />
          </span>
        }
        <input
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="input-base"
          [class.pl-10]="prefix()"
          [class.pr-10]="suffix() || type() === 'password'"
          [class.border-rose-400]="error()"
          [class.focus:ring-rose-400]="error()" />
        @if (suffix()) {
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))]">
            <ng-content select="[suffix]" />
          </span>
        }
      </div>
      @if (error()) {
        <p class="error-text">{{ error() }}</p>
      }
      @if (hint() && !error()) {
        <p class="text-xs text-[rgb(var(--color-muted))] mt-1">{{ hint() }}</p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  error = input<string>('');
  hint = input<string>('');
  prefix = input<boolean>(false);
  suffix = input<boolean>(false);

  value: string = '';
  isDisabled = false;
  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: string): void { this.value = v ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onInput(e: Event): void {
    this.value = (e.target as HTMLInputElement).value;
    this.onChange(this.value);
  }
}
