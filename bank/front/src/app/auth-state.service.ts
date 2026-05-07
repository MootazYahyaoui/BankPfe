import { Injectable, signal } from '@angular/core';

export type UserKind = 'admin' | 'client';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly tokenKey = 'propsbank.jwt';
  private readonly userKindKey = 'propsbank.userKind';
  readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
  readonly userKind = signal<UserKind>(
    (localStorage.getItem(this.userKindKey) as UserKind | null) ?? 'client'
  );

  readonly isAuthenticated = signal<boolean>(Boolean(this.token()));

  setSession(token: string, userKind: UserKind): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKindKey, userKind);
    this.token.set(token);
    this.userKind.set(userKind);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKindKey);
    this.token.set(null);
    this.userKind.set('client');
    this.isAuthenticated.set(false);
  }
}
