import { Component, inject, signal, computed, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { UserService } from "../../../core/services/user.service";
import { AuthStore } from "../../../shared/stores/auth.store";
import { UiStore } from "../../../shared/stores/ui.store";
import { MessageStore } from "../../../shared/stores/message.store";
import { LoaderComponent } from "../../../shared/ui/loader/loader.component";
import { extractBackendError } from "../../../shared/models/api.model";
import { NgIf, NgForOf, DatePipe } from "@angular/common";

@Component({
  selector: "app-my-profile",
  standalone: true,
  imports: [RouterLink, LoaderComponent, NgIf, NgForOf, DatePipe],
  template: `
    <div class="page-container  w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-0">
      @if (loading()) {
        <app-loader [fullPage]="true" />
      } @else {
        <div class="animate-fade-in space-y-4">
          <!-- Cover + Avatar card -->
          <div class="card p-0 overflow-hidden">
            <div
              class="aspect-[16/7] w-full relative bg-gradient-to-br from-whisper-500 to-rose-500"
            >
              @if (authStore.user()?.profileCover) {
                <img
                  [src]="authStore.user()!.profileCover"
                  alt="Cover"
                  class="w-full h-full object-cover object-[50%_20%]"
                />
              }
            </div>
            <div class="px-6 pb-6">
              <div class="flex items-end justify-between mt-5 mb-6">
                <img
                  [src]="avatarUrl()"
                  [alt]="displayName()"
                  class="w-20 h-20 avatar ring-4 ring-[rgb(var(--color-surface))] object-cover object-[50%_25%]"
                />
                <div class="flex gap-2 mb-1">
                  <a
                    routerLink="/profile/edit"
                    class="btn-secondary text-xs px-3 py-1.5"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </a>
                </div>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h1 class="font-display text-xl font-semibold">
                    {{ displayName() }}
                  </h1>
                  @if (authStore.user()?.confirmEmail) {
                    <svg
                      class="w-5 h-5 text-whisper-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  }
                </div>
                <p class="text-sm text-[rgb(var(--color-muted))]">
                  &#64;{{ authStore.user()?.userName }}
                </p>
                @if (authStore.user()?.bio) {
                  <p
                    class="text-sm text-[rgb(var(--color-text))] mt-2 leading-relaxed"
                  >
                    {{ authStore.user()?.bio }}
                  </p>
                }
              </div>
            </div>
          </div>
          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3">
            <div class="card text-center py-4">
              <p class="font-display text-2xl font-bold gradient-text">
                {{ messageStore.total() }}
              </p>
              <p class="text-xs text-[rgb(var(--color-muted))] mt-1">
                Messages
              </p>
            </div>
            <div class="card text-center py-4">
              <p class="font-display text-2xl font-bold gradient-text">
                {{ messageStore.unreadCount() }}
              </p>
              <p class="text-xs text-[rgb(var(--color-muted))] mt-1">Unread</p>
            </div>
            <div class="card text-center py-4">
              <p
                class="font-display text-2xl font-bold"
                [class.gradient-text]="authStore.user()?.isTwoFactorEnabled"
              >
                {{ authStore.user()?.isTwoFactorEnabled ? "ON" : "OFF" }}
              </p>
              <p class="text-xs text-[rgb(var(--color-muted))] mt-1">2FA</p>
            </div>
            <!-- Profile Views Card -->
            <div class="card text-center py-4">
              <p class="font-display text-2xl font-bold gradient-text">
                {{ authStore.user()?.profileViews }}
              </p>
              <p class="text-xs text-[rgb(var(--color-muted))] mt-1">
                Profile Views
              </p>
            </div>
          </div>

          <!-- Viewers List (with Scroll) -->
          <div *ngIf="authStore.user()?.viewers?.length > 0" class="card py-4">
            <h3 class="text-lg font-medium">Viewers:</h3>
            <div
              *ngIf="authStore.user()?.viewers?.length > 3"
              class="overflow-y-scroll max-h-20 mt-2"
            >
              <ul class="space-y-2">
                <li *ngFor="let viewer of authStore.user()?.viewers">
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ viewer.userName }}</span>
                    <span class="text-sm text-muted">{{
                      viewer.viewedAt | date: "short"
                    }}</span>
                  </div>
                </li>
              </ul>
            </div>
            <div *ngIf="authStore.user()?.viewers?.length <= 3" class="mt-2">
              <ul class="space-y-2">
                <li *ngFor="let viewer of authStore.user()?.viewers">
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ viewer.userName }}</span>
                    <span class="text-sm text-muted">{{
                      viewer.viewedAt | date: "short"
                    }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Show Phone Number (if owner) -->
          <div
            *ngIf="
              authStore.user()?.phone &&
              authStore.user()?._id === authStore.user()?._id
            "
            class="card py-4"
          >
            <p class="font-display text-lg">
              Phone: {{ authStore.user()?.phone }}
            </p>
          </div>

          <!-- Share link card -->
          <div
            class="card bg-gradient-to-r from-whisper-50 to-rose-50 dark:from-whisper-950/30 dark:to-rose-950/20 border-whisper-200 dark:border-whisper-800"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-whisper-100 dark:bg-whisper-900/60 flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-5 h-5 text-whisper-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-[rgb(var(--color-text))]">
                  Your anonymous link
                </p>
                <p
                  class="text-xs text-[rgb(var(--color-muted))] mt-0.5 font-mono truncate"
                >
                  {{ profileUrl() }}
                </p>
              </div>
              <button
                (click)="copyLink()"
                class="btn-primary text-xs px-3 py-1.5 flex-shrink-0"
              >
                @if (copied()) {
                  Copied!
                } @else {
                  Copy
                }
              </button>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              routerLink="/messages"
              class="card hover:border-whisper-300 transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-whisper-100 dark:bg-whisper-900/40 flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-whisper-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium">View messages</p>
                  <p class="text-xs text-[rgb(var(--color-muted))]">
                    {{ messageStore.total() }} total
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      }
    </div>
  `,
})
export class MyProfileComponent implements OnInit {
  authStore = inject(AuthStore);
  messageStore = inject(MessageStore);
  private userService = inject(UserService);
  private uiStore = inject(UiStore);

  loading = signal(true);
  copied = signal(false);

  displayName = computed(
    () =>
      this.authStore.user()?.displayName ??
      this.authStore.user()?.userName ??
      "User",
  );
  avatarUrl = computed(() => {
    const pic = this.authStore.user()?.profilePicture;
    return (
      pic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(this.displayName())}&background=6366f1&color=fff&size=128`
    );
  });
  profileUrl = computed(
    () =>
      `${window.location.origin}/profile/${this.authStore.user()?._id ?? ""}`,
  );

  ngOnInit(): void {
    const id = this.authStore.user()?._id;
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.userService.getProfile(id).subscribe({
      next: (res) => {
        console.log(res);
        
        if (res.data) this.authStore.setUser(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
      },
    });
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.profileUrl()).then(() => {
      this.copied.set(true);
      this.uiStore.success("Link copied!");
      setTimeout(() => this.copied.set(false), 2500);
    });
  }
}
