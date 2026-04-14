import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api.model';
import { Message } from '../../shared/models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/message`;

  sendMessage(receiverId: string, formData: FormData): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(`${this.base}/${receiverId}`, formData);
  }

  getMessages(): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.base}/list`);
  }

  getMessage(messageId: string): Observable<ApiResponse<Message>> {
    return this.http.get<ApiResponse<Message>>(`${this.base}/${messageId}`);
  }

  deleteMessage(messageId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${messageId}`);
  }
  markAsRead(messageId: string) {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${messageId}/read`, {});
  }
}
