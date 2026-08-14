import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; name?: string };
}

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private baseUrl = 'https://personal-finance-api-tvve.onrender.com/auth';
  private tokenKey = 'access_token';

  private _token = signal<string | null>(localStorage.getItem(this.tokenKey));
  isLoggedIn = computed(() => !!this._token());
  token = computed(() => this._token());

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => this.setToken(res.accessToken))
    );
  }

  logout() {
    this._token.set(null);
    localStorage.removeItem(this.tokenKey);
  }

  private setToken(token: string) {
    this._token.set(token);
    localStorage.setItem(this.tokenKey, token);
  }
}