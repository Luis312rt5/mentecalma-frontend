import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="header-content">
            <span class="emoji">🧠</span>
            <h1>MenteCalma</h1>
            <p>Crea tu cuenta</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="nombre" placeholder="Juan Pérez">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electrónico</mat-label>
              <input matInput formControlName="email" type="email" placeholder="tu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">El email es requerido</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Email inválido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="password"
                     [type]="showPassword ? 'text' : 'password'">
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">La contraseña es requerida</mat-error>
              <mat-error *ngIf="form.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
            </mat-form-field>

            <div class="error-message" *ngIf="errorMsg">
              <mat-icon>error</mat-icon> {{ errorMsg }}
            </div>

            <button mat-raised-button color="primary" class="full-width submit-btn"
                    type="submit" [disabled]="loading || form.invalid">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Crear cuenta</span>
            </button>

          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="login-link">
            ¿Ya tienes cuenta?
            <a routerLink="/login">Inicia sesión</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      border-radius: 16px;
      padding: 1rem;
    }
    .header-content {
      text-align: center;
      width: 100%;
      padding: 1rem 0;
    }
    .emoji { font-size: 3rem; display: block; }
    h1 { margin: 0.5rem 0 0.25rem; font-size: 1.8rem; color: #3f51b5; }
    p { color: #666; margin: 0; }
    .full-width { width: 100%; margin-bottom: 0.5rem; }
    .submit-btn { height: 48px; font-size: 1rem; margin-top: 1rem; }
    .error-message {
      color: #f44336;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }
    .login-link { text-align: center; color: #666; }
    .login-link a { color: #3f51b5; font-weight: 500; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  loading = false;
  errorMsg = '';

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    this.authService.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.mensaje || 'Error al registrarse. Intenta de nuevo.';
      }
    });
  }
}