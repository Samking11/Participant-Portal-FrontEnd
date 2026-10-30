import { Injectable, signal } from '@angular/core';

export interface UserSession {
  username: string;
  loginTime: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_session';
  private readonly authenticated = signal<boolean>(this.hasSession());

  readonly isAuthenticated = this.authenticated.asReadonly();

  isLoggedIn(): boolean {
    return this.authenticated();
  }

  login(username: string): void {
    const session: UserSession = {
      username: username.trim(),
      loginTime: Date.now(),
    };

    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(this.storageKey, JSON.stringify(session));
      } catch {
        // Fallback if sessionStorage is disabled or unavailable
      }
    }

    this.authenticated.set(true);
  }

  logout(): void {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(this.storageKey);
      } catch {
        // Ignore storage removal errors
      }
    }

    this.authenticated.set(false);
  }

  getCurrentUser(): UserSession | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    try {
      const raw = sessionStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as UserSession) : null;
    } catch {
      return null;
    }
  }

  private hasSession(): boolean {
    if (typeof sessionStorage === 'undefined') {
      return false;
    }

    try {
      return sessionStorage.getItem(this.storageKey) !== null;
    } catch {
      return false;
    }
  }
}
