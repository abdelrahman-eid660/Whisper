import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "../../../core/services/message.service";
import { MessageStore } from "../../../shared/stores/message.store";
import { UiStore } from "../../../shared/stores/ui.store";
import { AuthStore } from "../../../shared/stores/auth.store";
import { Message } from "../../../shared/models/message.model";
import { MessageSkeletonComponent } from "../../../shared/ui/skeleton/skeleton.component";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-message-list",
  standalone: true,
  imports: [MessageSkeletonComponent],
  template: `
    <div class="page-container">
      <div class="flex gap-2 mb-4">
        <button (click)="filter.set('all')" class="btn-secondary">All</button>
        <button (click)="filter.set('received')" class="btn-secondary">
          Received
        </button>
        <button (click)="filter.set('sent')" class="btn-secondary">Sent</button>
      </div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 class="section-title">Messages</h1>
          <p class="text-sm text-[rgb(var(--color-muted))] mt-1">
            {{ messageStore.total() }} message{{
              messageStore.total() !== 1 ? "s" : ""
            }}
          </p>
        </div>

        <button (click)="copyLink()" class="btn-primary">
          @if (copied()) {
            Copied!
          } @else {
            Share link
          }
        </button>
      </div>

      <!-- Loading -->
      @if (messageStore.loading() && messageStore.messages().length === 0) {
        <div class="space-y-3">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-message-skeleton />
          }
        </div>
      }

      <!-- Empty -->
      @else if (messageStore.isEmpty()) {
        <div class="text-center py-24 text-sm text-[rgb(var(--color-muted))]">
          No messages yet
        </div>
      }

      <!-- List -->
      @else {
        <div class="space-y-3">
          @for (msg of filteredMessages(); track msg._id) {
            <div
              class="card cursor-pointer transition-all group"
              (click)="openMessage(msg)"
              [class.border-l-4]="msg.direction === 'received'"
              [class.border-l-green-500]="msg.direction === 'received'"
              [class.border-l-blue-500]="msg.direction === 'sent'"
            >
              <div class="flex items-start gap-4">
                <!-- ICON -->
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  [class.bg-gradient-to-br]="msg.direction === 'received'"
                  [class.from-green-400]="msg.direction === 'received'"
                  [class.to-green-600]="msg.direction === 'received'"
                  [class.from-blue-400]="msg.direction === 'sent'"
                  [class.to-blue-600]="msg.direction === 'sent'"
                >
                  @if (msg.receiver?.profilePicture) {
                    <img
                      [src]="msg.receiver?.profilePicture"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                  } @else {
                    <svg
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                </div>

                <!-- CONTENT -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">
                      @if (msg.direction === "sent") {
                        To: {{ msg.receiver?.userName || "User" }}
                      } @else {
                        Anonymous
                      }
                    </span>

                    @if (msg.direction === "received") {
                      <span
                        class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700"
                      >
                        Received
                      </span>
                    } @else {
                      <span
                        class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700"
                      >
                        Sent
                      </span>
                    }
                    <div class="ml-auto flex items-center gap-2">
                      @if (msg.receiverId === authStore.user()?._id && !msg.isRead) {
                        <span
                          class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700"
                        >
                          New
                        </span>
                      }

                      <span class="text-xs text-gray-400">
                        {{ formatDate(msg.createdAt) }}
                      </span>
                    </div>
                  </div>

                  <p class="text-sm text-gray-700 line-clamp-2 mt-1">
                    {{ msg.content }}
                  </p>

                  @if (msg.attachments && msg.attachments.length > 0) {
                    <p class="text-xs text-gray-400 mt-2">
                      {{ msg.attachments.length }} attachment(s)
                    </p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MessageListComponent implements OnInit, OnDestroy {
  messageStore = inject(MessageStore);
  private messageService = inject(MessageService);
  private uiStore = inject(UiStore);
  public authStore = inject(AuthStore);
  private router = inject(Router);

  environment = environment;
  copied = signal(false);
  isLoading = signal(false);
  filter = signal<"all" | "sent" | "received">("all");

  profileUrl = computed(() => {
    const user = this.authStore.user();
    return user ? `${window.location.origin}/profile/${user._id}` : "";
  });
  filteredMessages = computed(() => {
    const msgs = this.messageStore.messages();
    const f = this.filter();

    if (f === "all") return msgs;
    return msgs.filter((m) => m.direction === f);
  });

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loadMessages();

    this.pollTimer = setInterval(() => {
      if (this.isLoading()) return;
      this.loadMessages(true);
    }, 120000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  loadMessages(silent = false): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    if (!silent) this.messageStore.setLoading(true);

    this.messageService.getMessages().subscribe({
      next: (res) => { 
        if (res.data) {
          this.messageStore.setMessages(res.data);
          this.messageStore.setTotal(res.data.length);
        }
        this.messageStore.setLoading(false);
        this.isLoading.set(false);
      },
      error: (err) => {       
        this.messageStore.setLoading(false);
        this.isLoading.set(false);
      },
    });
  }

  openMessage(msg: Message): void {
    this.router.navigate(["/messages", msg._id]);
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.profileUrl()).then(() => {
      this.copied.set(true);
      this.uiStore.success(
        "Link copied!",
        "Share it with anyone to receive anonymous messages.",
      );
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
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
}
