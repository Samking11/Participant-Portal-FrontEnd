import { Injectable, signal } from '@angular/core';

export type FeedbackType = 'success' | 'error';

export interface ToastMessage {
  type: FeedbackType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly autoDismissDelayMs = 5000;
  private dismissTimer: ReturnType<typeof setTimeout> | undefined;

  readonly toast = signal<ToastMessage | null>(null);

  showSuccess(message: string): void {
    this.show({ type: 'success', message });
  }

  showError(message: string): void {
    this.show({ type: 'error', message });
  }

  clear(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = undefined;
    }

    this.toast.set(null);
  }

  private show(message: ToastMessage): void {
    this.clear();
    this.toast.set(message);
    this.dismissTimer = setTimeout(() => {
      this.dismissTimer = undefined;
      this.toast.set(null);
    }, this.autoDismissDelayMs);
  }
}
