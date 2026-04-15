import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="logo">🧠 MenteCalma</span>
      <span class="spacer"></span>

      <nav *ngIf="auth.isLoggedIn()">
        <a mat-button routerLink="/dashboard" routerLinkActive="active-link">Inicio</a>
        <a mat-button routerLink="/checkin" routerLinkActive="active-link">Check-in</a>
        <a mat-button routerLink="/history" routerLinkActive="active-link">Historial</a>
        <a mat-button routerLink="/stats" routerLinkActive="active-link">Estadísticas</a>
        <a mat-button routerLink="/admin" routerLinkActive="active-link" *ngIf="auth.isAdmin()">Admin</a>
      </nav>

      <button mat-button [matMenuTriggerFor]="menu" *ngIf="auth.isLoggedIn()">
        <mat-icon>account_circle</mat-icon>
        {{ auth.getNombre() }}
      </button>

      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="auth.logout()">
          <mat-icon>logout</mat-icon>
          Cerrar sesión
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar { position: sticky; top: 0; z-index: 100; }
    .logo { font-size: 1.3rem; font-weight: bold; margin-right: 2rem; }
    .spacer { flex: 1; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
    nav a { margin: 0 4px; }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
}