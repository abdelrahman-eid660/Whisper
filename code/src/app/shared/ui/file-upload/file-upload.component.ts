import { Component, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      class="relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer"
      [ngClass]="isDragging() ? 'border-whisper-400 bg-whisper-50 dark:bg-whisper-950/30' : 'border-[rgb(var(--color-border))] hover:border-whisper-300 hover:bg-whisper-50/50 dark:hover:bg-whisper-950/20'"
      (dragover)="onDragOver($event)"
      (dragleave)="isDragging.set(false)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()">

      <input #fileInput type="file" class="hidden" [accept]="accept()" [multiple]="multiple()" (change)="onFileChange($event)">

      @if (preview()) {
        <div class="mb-3">
          <img [src]="preview()!" alt="Preview" class="mx-auto h-24 w-24 rounded-xl object-cover shadow-card">
        </div>
      } @else {
        <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-whisper-100 dark:bg-whisper-900/40 flex items-center justify-center">
          <svg class="w-6 h-6 text-whisper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      }

      <p class="text-sm font-medium text-[rgb(var(--color-text))]">
        {{ preview() ? 'Change ' + label() : 'Upload ' + label() }}
      </p>
      <p class="text-xs text-[rgb(var(--color-muted))] mt-1">{{ hint() }}</p>
    </div>
  `,
})
export class FileUploadComponent {
  label = input<string>('file');
  accept = input<string>('image/*');
  multiple = input<boolean>(false);
  hint = input<string>('PNG, JPG up to 5MB');

  fileSelected = output<File>();
  filesSelected = output<File[]>();

  isDragging = signal(false);
  preview = signal<string | null>(null);

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files || []);
    this.process(files);
  }

  onFileChange(e: Event): void {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    this.process(files);
  }

  private process(files: File[]): void {
    if (!files.length) return;
    if (this.multiple()) {
      this.filesSelected.emit(files);
    } else {
      this.fileSelected.emit(files[0]);
      const reader = new FileReader();
      reader.onload = () => this.preview.set(reader.result as string);
      reader.readAsDataURL(files[0]);
    }
  }

  setPreview(url: string): void {
    this.preview.set(url);
  }
}
