import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthStore } from '../../shared/stores/auth.store';
import { UiStore } from '../../shared/stores/ui.store';
import { MessageStore } from '../../shared/stores/message.store';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen mesh-bg flex">

      <!-- ── Desktop sidebar ─────────────────────────────────────────── -->
      <aside class="hidden lg:flex flex-col w-64 fixed top-0 left-0 h-full glass border-r border-[rgb(var(--color-border))] z-30">
        <!-- Logo -->
        <div class="p-6 border-b border-[rgb(var(--color-border))]">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span class="font-display font-semibold text-xl">Whisper</span>
          </div>
        </div>

        <!-- Nav links -->
        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/messages" routerLinkActive="!bg-whisper-500/10 !text-whisper-600 !border-whisper-300" class="nav-item">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Messages</span>
            @if (messageStore.unreadCount() > 0) {
              <span class="ml-auto badge bg-whisper-100 text-whisper-700 dark:bg-whisper-900/60 dark:text-whisper-300">
                {{ messageStore.unreadCount() }}
              </span>
            }
          </a>
          <a routerLink="/profile" routerLinkActive="!bg-whisper-500/10 !text-whisper-600 !border-whisper-300" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg><span>Profile</span>
          </a>

          <a routerLink="/profile/information" routerLinkActive="!bg-whisper-500/10 !text-whisper-600 !border-whisper-300" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 4l4 4-8 8-4-4 8-8zM12 12l-4 4-4-4 4-4 4 4z" />
          </svg><span>Edit Profile</span>
          </a>

          <a routerLink="/settings/security" routerLinkActive="!bg-whisper-500/10 !text-whisper-600 !border-whisper-300" class="nav-item">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Security</span>
          </a>
        </nav>

        <!-- Bottom: dark mode + user -->
        <div class="p-4 border-t border-[rgb(var(--color-border))] space-y-3">
          <button (click)="uiStore.toggleDarkMode()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[rgb(var(--color-muted))] hover:bg-whisper-50 dark:hover:bg-whisper-950/40 hover:text-whisper-600 transition-all">
            @if (uiStore.darkMode()) {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <span>Light Mode</span>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Dark Mode</span>
            }
          </button>

          <div class="flex items-center gap-3 px-3 py-2">
            <img [src]="avatarUrl()" [alt]="displayName()" class="w-8 h-8 avatar">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ displayName() }}</p>
              <p class="text-xs text-[rgb(var(--color-muted))] truncate">&#64;{{ authStore.user()?.userName }}</p>
            </div>
            <button (click)="doLogout()" title="Logout"
              class="text-[rgb(var(--color-muted))] hover:text-rose-500 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- ── Mobile top bar ──────────────────────────────────────────── -->
      <header class="lg:hidden fixed top-0 left-0 right-0 h-14 glass border-b border-[rgb(var(--color-border))] z-30 flex items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span class="font-display font-semibold">Whisper</span>
        </div>
        <div class="flex items-center gap-1">
          <button (click)="uiStore.toggleDarkMode()" class="btn-ghost p-2">
            @if (uiStore.darkMode()) {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
          </button>
          <button (click)="doLogout()" class="btn-ghost p-2 text-[rgb(var(--color-muted))] hover:text-rose-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <!-- ── Main content ─────────────────────────────────────────────── -->
      <main class="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen pb-16 lg:pb-0">
        <router-outlet />
      </main>

      <!-- ── Mobile bottom nav ────────────────────────────────────────── -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-[rgb(var(--color-border))] z-30 flex items-center">
        <a routerLink="/messages" routerLinkActive="text-whisper-600" class="mobile-nav-item">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="text-xs mt-0.5">Messages</span>
          @if (messageStore.unreadCount() > 0) {
            <span class="absolute top-2 right-1/3 w-2 h-2 rounded-full bg-whisper-500"></span>
          }
        </a>
        <a routerLink="/profile" routerLinkActive="text-whisper-600" class="mobile-nav-item">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-xs mt-0.5">Profile</span>
        </a>
        <a routerLink="/profile/information" routerLinkActive="text-whisper-600" class="mobile-nav-item">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span class="text-xs mt-0.5">Edit Profile</span>
        </a>
        <a routerLink="/settings/security" routerLinkActive="text-whisper-600" class="mobile-nav-item">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span class="text-xs mt-0.5">Security</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .nav-item {
      @apply relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
             text-[rgb(var(--color-muted))] border border-transparent
             hover:bg-whisper-50 dark:hover:bg-whisper-950/40 hover:text-whisper-600
             transition-all duration-200 cursor-pointer;
    }
    .mobile-nav-item {
      @apply relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5
             text-[rgb(var(--color-muted))] hover:text-whisper-600 transition-colors;
    }
  `],
})
export class MainLayoutComponent {
  authStore    = inject(AuthStore);
  uiStore      = inject(UiStore);
  messageStore = inject(MessageStore);
  private userService = inject(UserService);
  private router      = inject(Router);

  displayName = computed(() =>
   this.authStore.user()?.userName ?? 'User'
  );
  avatarUrl = computed(() => {
    const pic = this.authStore.user()?.profilePicture;
    return pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.displayName())}&background=6366f1&color=fff&size=64`;
  });

  doLogout(): void {
    this.userService.logout().subscribe({
      complete: () => { this.authStore.clear(); this.router.navigate(['/auth/login']); },
      error:    () => { this.authStore.clear(); this.router.navigate(['/auth/login']); },
    });
  }
}
