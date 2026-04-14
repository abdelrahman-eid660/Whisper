import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/ui/toast/toast.component';
import { GlobalLoaderComponent } from './shared/ui/loader/global-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, GlobalLoaderComponent],
  template: `
    <router-outlet />
    <app-toast />
    <app-global-loader />
  `,
})
export class AppComponent {}
