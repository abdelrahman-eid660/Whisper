import { Injectable, signal, computed } from '@angular/core';
import { Message } from '../models/message.model';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class MessageStore {
  private _messages = signal<Message[]>([]);
  private _selectedMessage = signal<Message | null>(null);
  private _loading = signal<boolean>(false);
  private _total = signal<number>(0);

  readonly messages = this._messages.asReadonly();
  readonly selectedMessage = this._selectedMessage.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  constructor(private authStore : AuthStore){}
  readonly unreadCount = computed(() => {
  const userId = this.authStore.user()?._id;
  return this._messages().filter(m =>
    m.receiverId === userId && !m.isRead
  ).length;
  });
  readonly isEmpty = computed(() =>
    !this._loading() && this._messages().length === 0
  );

  setMessages(messages: Message[]): void {
    this._messages.set(messages);
  }

  addMessage(message: Message): void {
    this._messages.update(msgs => [message, ...msgs]);
  }

  removeMessage(id: string): void {
    this._messages.update(msgs => msgs.filter(m => m._id !== id));
  }

  setSelected(message: Message | null): void {
    this._selectedMessage.set(message);
  }

  setLoading(val: boolean): void {
    this._loading.set(val);
  }

  setTotal(val: number): void {
    this._total.set(val);
  }

  markRead(id: string): void {
    this._messages.update(msgs =>
      msgs.map(m => m._id === id ? { ...m, isRead: true } : m)
    );
  }
}
