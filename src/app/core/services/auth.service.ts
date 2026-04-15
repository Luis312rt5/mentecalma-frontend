import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = 'http://localhost:8080/auth';

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, req).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, req).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return localStorage.getItem('rol') === 'ADMIN';
  }

  getNombre(): string {
    return localStorage.getItem('nombre') || '';
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('email', res.email);
    localStorage.setItem('nombre', res.nombre);
    localStorage.setItem('rol', res.rol);
  }
}