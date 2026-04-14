import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Decorative orbs -->
      <div class="absolute top-[-10%] left-[-5%] w-96 h-96 bg-whisper-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style="animation-delay:1.5s"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-whisper-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Logo -->
      <div class="absolute top-6 left-8 flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span class="font-display font-semibold text-lg text-[rgb(var(--color-text))]">Whisper</span>
      </div>

      <div class="w-full max-w-md animate-slide-up">
        <router-outlet />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
