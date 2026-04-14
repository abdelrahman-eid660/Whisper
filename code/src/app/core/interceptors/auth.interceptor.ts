import {
  HttpInterceptorFn, HttpRequest, HttpHandlerFn,
  HttpErrorResponse, HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { AuthStore, REFRESH_TOKEN_KEY } from '../../shared/stores/auth.store';
import { UserService } from '../services/user.service';
import { UiStore } from '../../shared/stores/ui.store';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authStore   = inject(AuthStore);
  const userService = inject(UserService);
  const uiStore     = inject(UiStore);

  // ── Attach access token to every request ──────────────────────────────────
  const accessToken = authStore.accessToken();
  const authedReq   = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // ── 401 handling: try to refresh ─────────────────────────────────────
      const isRotateCall = req.url.includes('/profile/rotate');
      const isAuthCall   = req.url.includes('/auth/');

      if (error.status === 401 && !isRotateCall && !isAuthCall && !isRefreshing) {
        isRefreshing = true;

        // Send the REFRESH token for the rotate call
        const refreshToken = authStore.refreshToken();
        const rotateReq = req.clone({
          url: `${req.url}`,  // placeholder – UserService builds the URL
          setHeaders: refreshToken
            ? { Authorization: `Bearer ${refreshToken}` }
            : {}
        });

        // Use UserService with a manually-built request so the interceptor
        // doesn't loop.  We send refresh token by creating a fresh request.
        const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

        return userService.rotateToken().pipe(
          switchMap(res => {
            isRefreshing = false;
            const newAccess  = res.data?.access_Token;
            const newRefresh = res.data?.refreash_Token;

            if (newAccess && newRefresh) {
              authStore.setAuth(authStore.user()!, newAccess, newRefresh);
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccess}` }
              });
              return next(retried);
            }
            authStore.clear();
            return throwError(() => error);
          }),
          catchError(refreshErr => {
            isRefreshing = false;
            authStore.clear();
            window.location.href = '/auth/login';
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
