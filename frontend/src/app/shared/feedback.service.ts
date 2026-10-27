import { Injectable, signal } from '@angular/core';

export type FeedbackType = 'success' | 'error';

export interface ToastMessage {
  type: FeedbackType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  readonly toast = signal<ToastMessage | null>(null);

  showSuccess(message: string): void {
    this.toast.set({ type: 'success', message });
  }

  showError(message: string): void {
    this.toast.set({ type: 'error', message });
  }

  clear(): void {
    this.toast.set(null);
  }
}
