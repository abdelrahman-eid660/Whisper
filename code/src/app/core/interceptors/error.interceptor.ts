import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiStore } from '../../shared/stores/ui.store';
import { extractBackendError } from '../../shared/models/api.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const uiStore = inject(UiStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't toast on rotate (handled by auth interceptor)
      if (req.url.includes('/profile/rotate')) return throwError(() => error);
      // Don't double-toast on 401 (auth interceptor handles it)
      if (error.status === 401) return throwError(() => error);

      const msg = extractBackendError(error);

      if      (error.status === 0)   uiStore.error('Connection Error', 'Cannot reach server.');
      else if (error.status === 403) uiStore.error('Forbidden', msg);
      else if (error.status === 404) uiStore.error('Not Found', msg);
      else if (error.status === 429) uiStore.error('Too Many Requests', 'Please wait before trying again.');
      else if (error.status >= 500)  uiStore.error('Server Error', 'Try again later.');
      else                           uiStore.error('Error', msg);

      return throwError(() => error);
    })
  );
};
