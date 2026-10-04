import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  readonly cookie = signal<string | null>(this.readCookie());

  setCookie(cookie: string | null): void {
    this.cookie.set(cookie);
    if (!cookie) {
      localStorage.removeItem('concesionaria.session');
      return;
    }

    localStorage.setItem('concesionaria.session', cookie);
  }

  clear(): void {
    this.cookie.set(null);
    localStorage.removeItem('concesionaria.session');
  }

  private readCookie(): string | null {
    return localStorage.getItem('concesionaria.session');
  }
}
