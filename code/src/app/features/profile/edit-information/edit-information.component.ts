import { Component, inject, OnInit, signal } from '@angular/core';
import { extractBackendError } from '../../../shared/models/api.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../shared/stores/auth.store';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { UiStore } from '../../../shared/stores/ui.store';
import { NgIf } from "@angular/common";
import { IEditProfile, User } from '../../../shared/models/user.model';
import { LoaderComponent } from "../../../shared/ui/loader/loader.component";

@Component({
  selector: 'app-edit-information',
imports: [ReactiveFormsModule, NgIf, LoaderComponent],
  template: `
    <div class="page-container max-w-2xl">
      @if (loading()) {
        <app-loader [fullPage]="true"/>
      }@else {
      <div class="flex items-center gap-3 mb-8">
        <button (click)="router.navigate(['/profile'])" class="btn-ghost p-2 -ml-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="section-title">Edit Profile</h1>
          <p class="text-sm text-[rgb(var(--color-muted))]">Update your details</p>
        </div>
      </div>

      <div class="space-y-4 animate-fade-in">

        <!-- User Information -->
        <div class="card space-y-4">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <!-- Username -->
            <div>
              <label class="label" for="userName">Username</label>
              <input type="text" id="userName" formControlName="userName" placeholder="Enter username" class="input-base" [class.border-rose-400]="fc['userName'].invalid && fc['userName'].touched" />
              <p class="error-text" *ngIf="fc['userName'].invalid && fc['userName'].touched">Username is required.</p>
            </div>

            <!-- Phone -->
            <div>
              <label class="label" for="Phone">Phone</label>
              <input type="text" id="Phone" formControlName="phone" placeholder="Enter phone number" class="input-base" [class.border-rose-400]="fc['phone'].invalid && fc['phone'].touched" />
              <p class="error-text" *ngIf="fc['phone'].invalid && fc['phone'].touched">Please enter a valid phone number.</p>
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="label" for="DOB">Date of Birth</label>
              <input type="date" id="DOB" formControlName="DOB" class="input-base" [class.border-rose-400]="fc['DOB'].invalid && fc['DOB'].touched" />
            </div>

            <!-- Gender -->
            <div>
              <label class="label" for="gender">Gender</label>
              <select formControlName="gender" id="gender" class="input-base" [class.border-rose-400]="fc['gender'].invalid && fc['gender'].touched">
                <option [value]="form.get('gender')?.value">Male</option>
                <option [value]="form.get('gender')?.value">Female</option>
              </select>
            </div>

            <!-- Bio -->
            <div>
              <label class="label" for="bio">Bio</label>
              <textarea formControlName="bio" id="bio" placeholder="Tell us about yourself" class="input-base" [class.border-rose-400]="fc['bio'].invalid && fc['bio'].touched"></textarea>
              <p class="error-text" *ngIf="fc['bio'].invalid && fc['bio'].touched">Bio is required.</p>
            </div>

            <!-- Submit Button -->
            <button type="submit" [disabled]="form.invalid || loading()" class="btn-primary w-full">
              <span *ngIf="loading()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Save Changes
            </button>
          </form>
        </div>
      </div>
      }

    </div>
  `,
})
export class EditInformationComponent implements OnInit {

  router = inject(Router);
  authStore = inject(AuthStore);
  private userService = inject(UserService);
  private uiStore = inject(UiStore);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    userName: ['', [Validators.required]],
    phone: ['', [Validators.pattern(/^(02|2|\+20)?01[0-25]\d{8}$/)]],
    DOB: [''],
    gender: [''],
    bio: ['', [Validators.minLength(2) , Validators.maxLength(100)]], 
  });

  loading = signal<boolean>(true);

  get fc() { return this.form.controls; }

ngOnInit(): void {
  const id = this.authStore.user()?._id;
  if (!id) {
    return;
  }
  this.userService.getProfile(id).subscribe({
    next: (res) => {
      this.loading.set(true)
        this.form.patchValue(res.data as User);
        if (res.data?.DOB) {
          const formattedDate = new Date(res.data?.DOB).toISOString().split('T')[0];
          this.form.get('DOB')?.setValue(formattedDate);
        }
        this.loading.set(false)
    },
    error: (err) => {
      this.uiStore.error('Error fetching profile');
    }
  });
}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.userService.updateAccount(this.authStore.user()?._id as string , this.form.value as IEditProfile).subscribe({
      next: res => {
        if (res.data) {
          this.authStore.setUser(res.data);  // Update user data in store
          this.uiStore.success('Profile updated successfully!');
        }
      },
      error: err => {
        this.uiStore.error('Update failed', extractBackendError(err));
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}