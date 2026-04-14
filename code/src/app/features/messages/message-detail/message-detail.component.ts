import { Component, inject, signal, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../../../core/services/message.service";
import { MessageStore } from "../../../shared/stores/message.store";
import { UiStore } from "../../../shared/stores/ui.store";
import { Message } from "../../../shared/models/message.model";
import { ModalComponent } from "../../../shared/ui/modal/modal.component";
import { LoaderComponent } from "../../../shared/ui/loader/loader.component";
import { AuthService } from "../../../core/services/auth.service";
import { AuthStore } from "../../../shared/stores/auth.store";

@Component({
  selector: "app-message-detail",
  standalone: true,
  imports: [ModalComponent, LoaderComponent],
  template: `
    <div class="page-container max-w-2xl">
      <!-- Back button -->
      <button (click)="goBack()" class="btn-ghost mb-6 -ml-2">
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to messages
      </button>

      @if (loading()) {
        <app-loader />
      } @else if (message()) {
        <div class="animate-fade-in space-y-4">
          <!-- Message card -->
          <div class="card space-y-5">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-full overflow-hidden">
                  @if (
                    message()?.direction === "sent" &&
                    message()?.receiver?.profilePicture
                  ) {
                    <img
                      [src]="message()?.receiver?.profilePicture"
                      class="w-full h-full object-cover"
                    />
                  } @else {
                    <div
                      class="w-full h-full bg-gradient-to-br from-whisper-400 to-whisper-600 flex items-center justify-center"
                    >
                      <svg class="w-5 h-5 text-white" ...></svg>
                    </div>
                  }
                </div>
                <div>
                  <p class="font-medium text-sm">
                    @if (message()?.direction === "sent") {
                      To: {{ message()?.receiver?.userName || "User" }}
                    } @else {
                      Anonymous
                    }
                  </p>
                  <p class="text-xs text-[rgb(var(--color-muted))]">
                    {{ formatDate(message()!.createdAt) }}
                  </p>
                </div>
              </div>
              <button
                (click)="confirmDelete.set(true)"
                class="btn-ghost p-2 text-[rgb(var(--color-muted))] hover:text-rose-500"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <!-- Divider -->
            <div class="h-px bg-[rgb(var(--color-border))]"></div>

            <!-- Content -->
            <div class="prose prose-sm max-w-none">
              <p
                class="text-base leading-relaxed text-[rgb(var(--color-text))] whitespace-pre-wrap"
              >
                {{ message()?.content }}
              </p>
            </div>

            <!-- Attachments -->
            @if (message()?.attachments && message()?.attachments!.length > 0) {
              <div class="space-y-2">
                <p
                  class="text-xs font-medium text-[rgb(var(--color-muted))] uppercase tracking-wide"
                >
                  Attachments
                </p>
                <div class="grid grid-cols-2 gap-2">
                  @for (att of message()?.attachments; track att) {
                    <a
                      [href]="att"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="group relative rounded-xl overflow-hidden border border-[rgb(var(--color-border))] hover:border-whisper-300 transition-all"
                    >
                      <img
                        [src]="att?.secure_url"
                        [alt]="'Attachment'"
                        class="w-full h-32 object-cover"
                        (error)="handleImgError($event)"
                      />
                      <div
                        class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center"
                      >
                        <svg
                          class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </a>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Action bar -->
          <div
            class="flex items-center justify-between p-4 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]"
          >
            <p class="text-xs text-[rgb(var(--color-muted))]">
              {{ message()?.direction === "sent" ? "Sent" : "Received" }}
              {{ formatFullDate(message()!.createdAt) }}
            </p>
            <button
              (click)="confirmDelete.set(true)"
              class="text-rose-500 hover:text-rose-600 text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete message
            </button>
            @if (message()?.direction === "sent") {
              <button
                (click)="sendAgain()"
                class="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1.5"
              >
                Send again
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-24">
          <p class="text-[rgb(var(--color-muted))]">Message not found.</p>
          <button (click)="goBack()" class="btn-primary mt-4">Go back</button>
        </div>
      }
    </div>

    <!-- Delete confirm modal -->
    <app-modal
      [open]="confirmDelete()"
      title="Delete message"
      (closed)="confirmDelete.set(false)"
    >
      <div class="space-y-4">
        <p class="text-sm text-[rgb(var(--color-muted))]">
          This action cannot be undone. The message will be permanently deleted.
        </p>
        <div class="flex gap-3">
          <button
            (click)="confirmDelete.set(false)"
            class="btn-secondary flex-1"
          >
            Cancel
          </button>
          @if (message()?.direction === "received") {
            <button
              (click)="deleteMessage()"
              [disabled]="deleting()"
              class="flex-1 btn-primary bg-gradient-to-r from-rose-600 to-rose-500 shadow-none hover:shadow-none"
            >
              @if (deleting()) {
                <span
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
              }
              Delete
            </button>
          }
        </div>
      </div>
    </app-modal>
  `,
})
export class MessageDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private messageStore = inject(MessageStore);
  private uiStore = inject(UiStore);
  private authStore = inject(AuthStore);

  message = signal<Message | null>(null);
  loading = signal(true);
  deleting = signal(false);
  confirmDelete = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")!;
    this.messageService.getMessage(id).subscribe({
      next: (res) => {
        if (res.data) {
          console.log({ res });

          this.message.set(res.data);
          this.messageStore.setSelected(res.data);
          const currentUser = this.authStore.user();

          if (res.data.receiverId === currentUser?._id) {
            this.messageService.markAsRead(id).subscribe({
              next: () => {
                this.messageStore.markRead(id);
              },
            });
          }
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  sendAgain(): void {
    const msg = this.message();
    if (!msg?.receiverId) return;

    this.router.navigate(["/send"], {
      queryParams: {
        receiverId: msg.receiverId,
      },
    });
  }
  deleteMessage(): void {
    const id = this.message()?._id;
    if (!id) return;
    this.deleting.set(true);
    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.messageStore.removeMessage(id);
        this.uiStore.success("Deleted", "Message removed successfully.");
        this.router.navigate(["/messages"]);
      },
      error: () => this.deleting.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(["/messages"]);
  }

  formatDate(d: string): string {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  formatFullDate(d: string): string {
    return new Date(d).toLocaleString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  handleImgError(e: Event): void {
    (e.target as HTMLImageElement).style.display = "none";
  }
}
