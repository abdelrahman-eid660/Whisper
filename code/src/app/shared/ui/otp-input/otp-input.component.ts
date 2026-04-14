import {
  Component, input, output, signal,
  ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit
} from '@angular/core';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  template: `
    <div class="flex gap-2.5 justify-center" (paste.window)="onWindowPaste($event)">
      @for (i of slots(); track i) {
        <input
          #box
          type="text"
          inputmode="numeric"
          maxlength="1"
          autocomplete="one-time-code"
          [value]="digits()[i]"
          (keydown)="onKey($event, i)"
          (input)="onInput($event, i)"
          class="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl
                 border-2 border-[rgb(var(--color-border))]
                 bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))]
                 focus:outline-none focus:border-whisper-500 focus:ring-2 focus:ring-whisper-500/20
                 transition-all duration-200 select-none"
          [class.border-whisper-400]="digits()[i] !== ''"
          placeholder="·" />
      }
    </div>
  `,
})
export class OtpInputComponent implements OnInit, AfterViewInit {
  length   = input<number>(6);
  disabled = input<boolean>(false);
  otpChange = output<string>();

  @ViewChildren('box') boxes!: QueryList<ElementRef<HTMLInputElement>>;

  digits = signal<string[]>([]);
  slots  = signal<number[]>([]);

  ngOnInit(): void {
    this.slots.set(Array.from({ length: this.length() }, (_, i) => i));
    this.digits.set(Array(this.length()).fill(''));
  }

  ngAfterViewInit(): void {
    setTimeout(() => this._focus(0), 80);
  }

  onInput(e: Event, i: number): void {
    const el  = e.target as HTMLInputElement;
    const val = el.value.replace(/\D/g, '').slice(-1);
    el.value  = val;
    const d   = [...this.digits()];
    d[i]      = val;
    this.digits.set(d);
    this._emit();
    if (val && i < this.length() - 1) this._focus(i + 1);
  }

  onKey(e: KeyboardEvent, i: number): void {
    if (e.key === 'Backspace') {
      const d = [...this.digits()];
      if (d[i]) { d[i] = ''; this.digits.set(d); this._emit(); }
      else if (i > 0) { this._focus(i - 1); }
    } else if (e.key === 'ArrowLeft'  && i > 0)                this._focus(i - 1);
    else if (e.key === 'ArrowRight' && i < this.length() - 1) this._focus(i + 1);
  }

onWindowPaste(e: Event): void {
  const event = e as ClipboardEvent;

  const text = event.clipboardData?.getData('text').replace(/\D/g, '') ?? '';
  if (!text) return;

  event.preventDefault();

  const d = Array(this.length()).fill('');
  text.slice(0, this.length()).split('').forEach((c, idx) => d[idx] = c);

  this.digits.set(d);
  this._emit();

  // sync DOM values
  this.boxes.toArray().forEach((b, idx) => b.nativeElement.value = d[idx]);

  this._focus(Math.min(text.length, this.length() - 1));
}
  reset(): void {
    this.digits.set(Array(this.length()).fill(''));
    this.boxes?.toArray().forEach(b => b.nativeElement.value = '');
    this._emit();
    this._focus(0);
  }

  private _focus(i: number): void {
    this.boxes?.toArray()[i]?.nativeElement.focus();
  }

  private _emit(): void {
    this.otpChange.emit(this.digits().join(''));
  }
}
