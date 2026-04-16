import { Component, inject, signal, OnInit, computed } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { UserService } from "../../../core/services/user.service";
import { MessageService } from "../../../core/services/message.service";
import { PublicUser } from "../../../shared/models/user.model";
import { FileUploadComponent } from "../../../shared/ui/file-upload/file-upload.component";
import { LoaderComponent } from "../../../shared/ui/loader/loader.component";
import { UiStore } from "../../../shared/stores/ui.store";
import { extractBackendError } from "../../../shared/models/api.model";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-public-profile",
  standalone: true,
  imports: [ReactiveFormsModule, FileUploadComponent, LoaderComponent, NgIf],
  template: `
    <div class="min-h-screen mesh-bg">
      <div
        class="fixed top-[-10%] left-[-5%] w-96 h-96 bg-whisper-500/15 rounded-full blur-3xl pointer-events-none"
      ></div>
      <div
        class="fixed bottom-[-10%] right-[-5%] w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"
      ></div>

      <!-- Top logo bar -->
      <header
        class="fixed top-0 left-0 right-0 z-20 flex justify-center py-4 pointer-events-none"
      >
        <div
          class="pointer-events-auto flex items-center gap-2 glass px-4 py-2 rounded-full shadow-glass"
        >
          <div
            class="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center"
          >
            <svg
              class="w-3.5 h-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span class="font-display font-semibold text-sm">Whisper</span>
        </div>
      </header>

      <div class="pt-20 pb-16 px-4 max-w-lg mx-auto">
        @if (loadingProfile()) {
          <app-loader [fullPage]="true" />
        } @else if (!user()) {
          <div class="text-center py-24">
            <h1 class="font-display text-2xl font-semibold mb-2">
              User not found
            </h1>
            <p class="text-[rgb(var(--color-muted))]">
              This profile doesn't exist.
            </p>
          </div>
        } @else {
          <!-- Profile card -->
          <div class="glass-card overflow-hidden mb-6 animate-slide-up">
            <div
              class="h-40 sm:h-48 relative"
              [style.background]="
                !user()?.profileCover
                  ? 'linear-gradient(135deg,#6366f1,#f43f5e)'
                  : ''
              "
            >
              @if (user()?.profileCover) {
                <img
                  [src]="user()!.profileCover"
                  alt="Cover"
                  class="w-full h-full object-cover object-[50%_20%]"
                />
              }
            </div>
            <div class="px-6 pb-6">
              <div class="-mt-10 mb-4">
                <img
                  [src]="avatarUrl()"
                  [alt]="displayName()"
                  class="w-20 h-20 avatar ring-4 ring-white dark:ring-gray-900 mt-10"
                />
              </div>
              <h1 class="font-display text-xl font-semibold">
                {{ displayName() }}
              </h1>
              <p class="text-sm text-[rgb(var(--color-muted))]">
                &#64;{{ user()?.userName }}
              </p>
              @if (user()?.bio) {
                <p
                  class="text-sm text-[rgb(var(--color-text))] mt-2 leading-relaxed"
                >
                  {{ user()!.bio }}
                </p>
              }
            </div>
          </div>

          <!-- Message form -->
          @if (!sent()) {
            <div
              class="glass-card p-6 animate-slide-up"
              style="animation-delay:.1s"
            >
              <div class="flex items-center gap-2 mb-4">
                <div
                  class="w-2 h-2 rounded-full bg-whisper-500 animate-pulse"
                ></div>
                <p class="text-sm font-medium">Send an anonymous message</p>
              </div>

              <form [formGroup]="form" (ngSubmit)="send()" class="space-y-4">
                <div>
                  <textarea
                    formControlName="content"
                    rows="4"
                    placeholder="Write something honest, kind, or curious..."
                    class="input-base resize-none text-base"
                    [class.border-rose-400]="
                      form.controls['content'].invalid &&
                      form.controls['content'].touched
                    "
                  >
                  </textarea>
                  <div class="flex items-center justify-between mt-1.5">
                    @if (
                      form.controls["content"].hasError("minlength") &&
                      form.controls["content"].touched
                    ) {
                      <p class="error-text">Minimum 2 characters.</p>
                    } @else {
                      <span></span>
                    }
                    <span class="text-xs text-[rgb(var(--color-muted))]"
                      >{{ form.value.content?.length || 0 }}/1000</span
                    >
                  </div>
                </div>

                <!-- Attachment -->
                <div>
                  <button
                    type="button"
                    (click)="showAttach.set(!showAttach())"
                    class="text-xs flex items-center gap-1.5 text-[rgb(var(--color-muted))] hover:text-whisper-600 transition-colors"
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
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    {{
                      showAttach()
                        ? "Remove attachment"
                        : "Add attachment (optional)"
                    }}
                  </button>
                  @if (showAttach()) {
                    <div class="mt-3">
                      <app-file-upload
                        label="attachment"
                        hint="PNG, JPG up to 10MB"
                        (fileSelected)="addFile($event)"
                      />
                      @if (attachedFiles().length) {
                        <div class="mt-2 space-y-1">
                          @for (file of attachedFiles(); track file.name) {
                            <p
                              class="text-xs text-whisper-600 flex items-center justify-between"
                            >
                              ✓ {{ file.name }}
                              <button type="button" (click)="removeFile(file)">
                                ✕
                              </button>
                            </p>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Anonymity notice -->
                <div
                  class="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-whisper-50 dark:bg-whisper-950/40 border border-whisper-100 dark:border-whisper-900/60"
                >
                  <svg
                    class="w-4 h-4 text-whisper-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p class="text-xs text-whisper-700 dark:text-whisper-300">
                    Your identity is completely anonymous.
                    {{ displayName() }} won't know who sent this.
                  </p>
                </div>

                <button
                  type="submit"
                  [disabled]="
                    sending() ||
                    form.invalid ||
                    (!form.controls['content'].value &&
                      attachedFiles().length === 0)
                  "
                  class="btn-primary w-full py-3 text-base"
                >
                  <span
                    *ngIf="sending()"
                    class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  ></span>
                  Send anonymously
                </button>
              </form>
            </div>
          } @else {
            <div class="glass-card p-8 text-center animate-scale-in">
              <div
                class="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4"
              >
                <svg
                  class="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 class="font-display text-xl font-semibold mb-2">Sent! 🎉</h2>
              <p class="text-sm text-[rgb(var(--color-muted))] mb-6">
                Your anonymous message was delivered.
              </p>
              <button (click)="reset()" class="btn-secondary">
                Send another
              </button>
            </div>
          }

          <p class="text-center text-xs text-[rgb(var(--color-muted))] mt-6">
            Powered by <span class="gradient-text font-semibold">Whisper</span>
          </p>
        }
      </div>
    </div>
  `,
})
export class PublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private uiStore = inject(UiStore);
  private fb = inject(FormBuilder);
  ReciverId = signal<string | null>(null);
  sendAsUser = signal<boolean>(false);
  user = signal<PublicUser | null>(null);
  loadingProfile = signal<boolean>(true);
  sending = signal<boolean>(false);
  sent = signal<boolean>(false);
  showAttach = signal<boolean>(false);
  attachedFile = signal<File | null>(null);
  attachedFiles = signal<File[]>([]);

  form = this.fb.group({
    content: ["", [Validators.minLength(2), Validators.maxLength(1000)]],
    attachments: [null],
  });

  displayName = computed(() => this.user()?.userName ?? "");
  avatarUrl = computed(() => {
    const pic = this.user()?.profilePicture;
    return (
      pic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(this.displayName())}&background=6366f1&color=fff&size=128`
    );
  });

  ngOnInit(): void {
    // Route is /p/:username – backend endpoint is GET /profile/:id
    // We use the username as the id param (backend accepts both)
     this.ReciverId.set(this.route.snapshot.paramMap.get("id")) as unknown as string
     if(!this.ReciverId())return
     this.userService.getPublicProfile(this.ReciverId() as string).subscribe({
       next: (res) => {
         if (res.data) this.user.set(res.data);
        this.loadingProfile.set(false);
      },
      error: (err) => {
        (this.loadingProfile.set(false));
      },
    });
  }
  addFile(file: File): void {
    this.attachedFiles.update((files) => [...files, file]);
  }
  removeFile(file: File): void {
    this.attachedFiles.update((files) => files.filter((f) => f !== file));
  }
  send(): void {
    if (this.ReciverId() as unknown  as string === this.user()!.viewerId as string) {
      this.uiStore.error("Invalid action", "You can't send a message to yourself");
      return;
    }
    if (
      !this.form.controls["content"].value &&
      this.attachedFiles().length === 0
    ) {
      return; 
    }

    this.sending.set(true);

    const fd = new FormData();
    const content = this.form.value.content;

    if (content) {
      fd.append("content", content);
    }
    this.attachedFiles().forEach((file) => {
      fd.append("attachments", file);
    });
    this.messageService.sendMessage(this.user()!._id, fd).subscribe({
      next: (res) => {        
        this.sent.set(true);
        this.sending.set(false);
      },
      error: (err) => {        
        this.uiStore.error("Failed to send", extractBackendError(err));
        this.sending.set(false);
      },
    });
  }

  reset(): void {
    this.sent.set(false);
    this.form.reset();
    this.attachedFile.set(null);
    this.showAttach.set(false);
  }
}
