import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserSession {
  username: string;
  loginTime: number;
  accessToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  grant_type: 'password';
  client_id: 'participant-portal';
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
  scope?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'auth_session';
  private readonly apiUrl = `${environment.apiUrl}/auth/login`;
  private readonly authenticated = signal<boolean>(this.hasValidSession());

  readonly isAuthenticated = this.authenticated.asReadonly();

  isLoggedIn(): boolean {
    return this.authenticated();
  }

  login(username: string, password: string): Observable<void> {
    const request: LoginRequest = {
      username: username.trim(),
      password,
      grant_type: 'password',
      client_id: 'participant-portal',
    };

    return this.http.post<TokenResponse>(this.apiUrl, request).pipe(
      tap((tokens) => {
        if (!tokens.access_token) {
          throw new Error('The authentication response did not contain an access token.');
        }

        this.storeSession(request.username, tokens.access_token);
      }),
      map(() => undefined),
    );
  }

  getAccessToken(): string | null {
    return this.getCurrentUser()?.accessToken ?? null;
  }

  private storeSession(username: string, accessToken: string): void {
    const session: UserSession = {
      username,
      loginTime: Date.now(),
      accessToken,
    };

    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(this.storageKey, JSON.stringify(session));
      } catch {
        this.authenticated.set(false);
        throw new Error('Unable to store the authentication session.');
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
      const session = raw ? (JSON.parse(raw) as Partial<UserSession>) : null;
      if (!session?.username || !session.accessToken || typeof session.accessToken !== 'string') {
        return null;
      }
      return session as UserSession;
    } catch {
      return null;
    }
  }

  private hasValidSession(): boolean {
    if (typeof sessionStorage === 'undefined') {
      return false;
    }

    try {
      return this.getCurrentUser() !== null;
    } catch {
      return false;
    }
  }
}
