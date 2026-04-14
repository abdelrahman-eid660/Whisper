import { Injectable } from '@angular/core';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleService {

  init(clientId: string, callback: (token: string) => void) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (res: any) => {
        callback(res.credential);
      },
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        theme: 'outline',
        size: 'large',
        width: 300,
      }
    );
  }
}