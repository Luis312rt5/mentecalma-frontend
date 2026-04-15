import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/services/auth.service';
import { CheckinService } from '../../core/services/checkin.service';
import { UserStatsResponse } from '../../core/models/stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule
  ],
  template: `
    <div class="dashboard-container">

      <!-- Saludo -->
      <div class="welcome-section">
        <h1>¡Hola, {{ auth.getNombre() }}! 👋</h1>
        <p>¿Cómo te sientes hoy? Registra tu check-in diario.</p>
      </div>

      <!-- Botón principal -->
      <div class="main-action">
        <button mat-raised-button color="primary" routerLink="/checkin" class="checkin-btn">
          <mat-icon>add_circle</mat-icon>
          Hacer Check-in del día
        </button>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-grid" *ngIf="stats">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon blue">calendar_today</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalCheckins }}</span>
              <span class="stat-label">Check-ins totales</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon" [class]="getEstresColor()">psychology</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.promedioEstresUltimos7Dias | number:'1.1-1' }}</span>
              <span class="stat-label">Estrés promedio (7 días)</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon green">check_circle</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.habitosCompletados }}</span>
              <span class="stat-label">Hábitos completados</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon orange">local_fire_department</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ stats.rachaActualDias }}</span>
              <span class="stat-label">Días de racha</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Nivel de estrés visual -->
      <mat-card class="stress-card" *ngIf="stats">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>monitor_heart</mat-icon>
            Nivel de estrés últimos 7 días
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="stress-bar-container">
            <mat-progress-bar
              mode="determinate"
              [value]="(stats.promedioEstresUltimos7Dias / 10) * 100"
              [color]="getEstresMatColor()">
            </mat-progress-bar>
            <span class="stress-value">{{ stats.promedioEstresUltimos7Dias | number:'1.1-1' }} / 10</span>
          </div>
          <p class="stress-message">{{ getEstresMessage() }}</p>
        </mat-card-content>
      </mat-card>

      <!-- Accesos rápidos -->
      <div class="quick-actions">
        <h2>Accesos rápidos</h2>
        <div class="actions-grid">
          <mat-card class="action-card" routerLink="/history">
            <mat-card-content>
              <mat-icon>history</mat-icon>
              <span>Historial</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="action-card" routerLink="/stats">
            <mat-card-content>
              <mat-icon>bar_chart</mat-icon>
              <span>Estadísticas</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="action-card" routerLink="/checkin">
            <mat-card-content>
              <mat-icon>edit_note</mat-icon>
              <span>Nuevo Check-in</span>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .welcome-section {
      margin-bottom: 1.5rem;
    }
    .welcome-section h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem;
      color: #3f51b5;
    }
    .welcome-section p { color: #666; margin: 0; }
    .main-action { margin-bottom: 2rem; }
    .checkin-btn {
      height: 56px;
      font-size: 1.1rem;
      padding: 0 2rem;
      border-radius: 28px;
    }
    .checkin-btn mat-icon { margin-right: 8px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.2rem;
    }
    .stat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
    .stat-icon.blue { color: #3f51b5; }
    .stat-icon.green { color: #4caf50; }
    .stat-icon.orange { color: #ff9800; }
    .stat-value { font-size: 2rem; font-weight: bold; display: block; }
    .stat-label { color: #666; font-size: 0.85rem; }
    .stress-card { margin-bottom: 1.5rem; }
    .stress-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stress-bar-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1rem 0;
    }
    mat-progress-bar { flex: 1; height: 12px; border-radius: 6px; }
    .stress-value { font-weight: bold; min-width: 50px; }
    .stress-message { color: #666; margin: 0; }
    .quick-actions h2 { color: #3f51b5; margin-bottom: 1rem; }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .action-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    .action-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 1.5rem;
    }
    .action-card mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #3f51b5;
    }
    .action-card span { font-weight: 500; color: #333; }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private checkinService = inject(CheckinService);

  stats: UserStatsResponse | null = null;

  ngOnInit(): void {
    this.checkinService.obtenerEstadisticas().subscribe({
      next: data => this.stats = data,
      error: () => {}
    });
  }

  getEstresColor(): string {
    const val = this.stats?.promedioEstresUltimos7Dias || 0;
    if (val <= 3) return 'green';
    if (val <= 6) return 'orange';
    return 'red';
  }

  getEstresMatColor(): 'primary' | 'accent' | 'warn' {
    const val = this.stats?.promedioEstresUltimos7Dias || 0;
    if (val <= 3) return 'primary';
    if (val <= 6) return 'accent';
    return 'warn';
  }

  getEstresMessage(): string {
    const val = this.stats?.promedioEstresUltimos7Dias || 0;
    if (val <= 3) return '😊 Tu nivel de estrés está bajo control. ¡Sigue así!';
    if (val <= 6) return '😐 Nivel de estrés moderado. Recuerda practicar tus rutinas.';
    return '😰 Tu nivel de estrés es alto. Te recomendamos hacer un check-in hoy.';
  }
}