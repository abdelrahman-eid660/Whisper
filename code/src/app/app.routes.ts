import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/messages', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: '',                    redirectTo: 'login', pathMatch: 'full' },
      { path: 'login',               loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'signup',              loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent) },
      { path: 'confirm-email',       loadComponent: () => import('./features/auth/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent) },
      { path: 'confirm-login',       loadComponent: () => import('./features/auth/confirm-login/confirm-login.component').then(m => m.ConfirmLoginComponent) },
      { path: 'forgot-password',     loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'confirm-forgot',      loadComponent: () => import('./features/auth/confirm-forgot/confirm-forgot.component').then(m => m.ConfirmForgotComponent) },
      { path: 'reset-password',      loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    ]
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'messages',            loadComponent: () => import('./features/messages/message-list/message-list.component').then(m => m.MessageListComponent) },
      { path: 'messages/:id',        loadComponent: () => import('./features/messages/message-detail/message-detail.component').then(m => m.MessageDetailComponent) },
      { path: 'profile',             loadComponent: () => import('./features/profile/my-profile/my-profile.component').then(m => m.MyProfileComponent) },
      { path: 'profile/edit',        loadComponent: () => import('./features/profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent) },
      { path: 'profile/information',        loadComponent: () => import('./features/profile/edit-information/edit-information.component').then(m => m.EditInformationComponent) },
      { path: 'settings/security',   loadComponent: () => import('./features/settings/security/security.component').then(m => m.SecurityComponent) },
    ]
  },

  { path: 'profile/:id', loadComponent: () => import('./features/profile/public-profile/public-profile.component').then(m => m.PublicProfileComponent) },

  { path: '**', redirectTo: '/messages' }
];
