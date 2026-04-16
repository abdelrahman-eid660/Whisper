import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthStore } from '../../../shared/stores/auth.store';
import { UiStore } from '../../../shared/stores/ui.store';
import { FileUploadComponent } from '../../../shared/ui/file-upload/file-upload.component';
import { extractBackendError } from '../../../shared/models/api.model';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [FileUploadComponent],
  template: `
    <div class="page-container max-w-2xl">
      <div class="flex items-center gap-3 mb-8">
        <button (click)="router.navigate(['/profile'])" class="btn-ghost p-2 -ml-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="section-title">Edit Profile</h1>
          <p class="text-sm text-[rgb(var(--color-muted))]">Update your photos</p>
        </div>
      </div>

      <div class="space-y-4 animate-fade-in">

        <!-- Profile picture -->
        <div class="card space-y-4">
          <div class="flex items-center gap-3">
            <img [src]="currentAvatar()" alt="Current avatar" class="w-12 h-12 avatar" />
            <div>
              <h2 class="text-sm font-semibold">Profile Photo</h2>
              <p class="text-xs text-[rgb(var(--color-muted))]">PNG or JPG, recommended 400×400px</p>
            </div>
          </div>
          <app-file-upload
            label="profile photo"
            hint="PNG or JPG up to 12MB"
            (fileSelected)="uploadProfilePic($event)" />
          @if (uploadingProfile()) {
            <div class="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))]">
              <span class="w-4 h-4 border-2 border-whisper-300 border-t-whisper-600 rounded-full animate-spin"></span>
              Uploading...
            </div>
          }
        </div>

        <!-- Cover picture -->
        <div class="card space-y-4">
          <div>
            <h2 class="text-sm font-semibold">Cover Photo</h2>
            <p class="text-xs text-[rgb(var(--color-muted))]">PNG or JPG, recommended 1500×500px</p>
          </div>
          @if (authStore.user()?.profileCover) {
            <img [src]="authStore.user()!.profileCover" alt="Cover" class="w-full h-20 rounded-xl object-cover" />
          }
          <app-file-upload
            label="cover photo"
            hint="PNG or JPG up to 10MB"
            (fileSelected)="uploadCoverPic($event)" />
          @if (uploadingCover()) {
            <div class="flex items-center gap-2 text-sm text-[rgb(var(--color-muted))]">
              <span class="w-4 h-4 border-2 border-whisper-300 border-t-whisper-600 rounded-full animate-spin"></span>
              Uploading...
            </div>
          }
        </div>

      </div>
    </div>
  `,
})
export class EditProfileComponent {
  router      = inject(Router);
  authStore   = inject(AuthStore);
  private userService = inject(UserService);
  private uiStore     = inject(UiStore);

  uploadingProfile = signal(false);
  uploadingCover   = signal(false);

  currentAvatar() {
    const pic  = this.authStore.user()?.profilePicture;
    const name = this.authStore.user()?.userName ?? 'U';
    return pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
  }

  uploadProfilePic(file: File): void {
    const fd = new FormData();
    fd.append('profilePicture', file);
    this.uploadingProfile.set(true);
    this.userService.updateProfilePicture(fd).subscribe({
      next: res => {        
        if (res.data) this.authStore.setUser(res.data);
        this.uiStore.success('Profile photo updated!');
        this.uploadingProfile.set(false);
      },
      error: err => {        
        this.uiStore.error('Upload failed', extractBackendError(err));
        this.uploadingProfile.set(false);
      },
    });
  }

  uploadCoverPic(file: File): void {
    const fd = new FormData();
    fd.append('profileCover', file);
    this.uploadingCover.set(true);
    this.userService.updateCoverPicture(fd).subscribe({
      next: res => {        
        if (res.data) this.authStore.setUser({...res.data , profilePicture : res.data.profilePicture});
        this.uiStore.success('Cover photo updated!');
        this.uploadingCover.set(false);
      },
      error: err => {        
        this.uiStore.error('Upload failed', extractBackendError(err));
        this.uploadingCover.set(false);
      },
    });
  }
}
