import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CheckinService } from '../../core/services/checkin.service';
import { UserStatsResponse } from '../../core/models/stats.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="stats-container">
      <div class="page-header">
        <mat-icon>bar_chart</mat-icon>
        <h1>Mis Estadísticas</h1>
        <p>Resumen de tu bienestar emocional</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading && stats">

        <!-- Tarjetas principales -->
        <div class="stats-grid">
          <mat-card class="stat-card primary">
            <mat-card-content>
              <mat-icon>calendar_today</mat-icon>
              <div class="stat-data">
                <span class="big-number">{{ stats.totalCheckins }}</span>
                <span class="stat-desc">Check-ins totales</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card success">
            <mat-card-content>
              <mat-icon>check_circle</mat-icon>
              <div class="stat-data">
                <span class="big-number">{{ stats.habitosCompletados }}</span>
                <span class="stat-desc">Hábitos completados</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card warning">
            <mat-card-content>
              <mat-icon>local_fire_department</mat-icon>
              <div class="stat-data">
                <span class="big-number">{{ stats.rachaActualDias }}</span>
                <span class="stat-desc">Días de racha</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card info" *ngIf="stats.efectividadPromedio">
            <mat-card-content>
              <mat-icon>star</mat-icon>
              <div class="stat-data">
                <span class="big-number">{{ stats.efectividadPromedio | number:'1.1-1' }}</span>
                <span class="stat-desc">Efectividad promedio</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Nivel de estrés -->
        <mat-card class="stress-detail-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>monitor_heart</mat-icon>
              Nivel de estrés promedio
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stress-row">
              <span class="period-label">Últimos 7 días</span>
              <mat-progress-bar mode="determinate"
                [value]="(stats.promedioEstresUltimos7Dias / 10) * 100"
                [color]="getColor(stats.promedioEstresUltimos7Dias)">
              </mat-progress-bar>
              <span class="period-value">{{ stats.promedioEstresUltimos7Dias | number:'1.1-1' }}/10</span>
            </div>
            <div class="stress-row">
              <span class="period-label">Últimos 30 días</span>
              <mat-progress-bar mode="determinate"
                [value]="(stats.promedioEstresUltimos30Dias / 10) * 100"
                [color]="getColor(stats.promedioEstresUltimos30Dias)">
              </mat-progress-bar>
              <span class="period-value">{{ stats.promedioEstresUltimos30Dias | number:'1.1-1' }}/10</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Recomendación más efectiva -->
        <mat-card class="top-rec-card" *ngIf="stats.recomendacionMasEfectiva">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>emoji_events</mat-icon>
              Tu recomendación más efectiva
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="top-rec">
              <span class="trophy">🏆</span>
              <div>
                <h3>{{ stats.recomendacionMasEfectiva }}</h3>
                <p>Efectividad promedio: {{ stats.efectividadPromedio | number:'1.1-1' }}/5 ⭐</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      </ng-container>

      <div class="bottom-actions">
        <button mat-raised-button color="primary" routerLink="/checkin">
          <mat-icon>add</mat-icon>
          Nuevo Check-in
        </button>
        <button mat-stroked-button routerLink="/dashboard">
          <mat-icon>home</mat-icon>
          Inicio
        </button>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .page-header mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #3f51b5;
    }
    .page-header h1 { color: #3f51b5; margin: 0.5rem 0; }
    .page-header p { color: #666; margin: 0; }
    .loading { display: flex; justify-content: center; padding: 3rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
    }
    .stat-card mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }
    .stat-card.primary mat-icon { color: #3f51b5; }
    .stat-card.success mat-icon { color: #4caf50; }
    .stat-card.warning mat-icon { color: #ff9800; }
    .stat-card.info mat-icon { color: #9c27b0; }
    .big-number {
      font-size: 2.2rem;
      font-weight: bold;
      display: block;
      line-height: 1;
    }
    .stat-desc { color: #666; font-size: 0.85rem; }
    .stress-detail-card, .top-rec-card { margin-bottom: 1.5rem; }
    .stress-detail-card mat-card-title,
    .top-rec-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stress-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1rem 0;
    }
    .period-label { min-width: 120px; color: #555; font-size: 0.9rem; }
    mat-progress-bar { flex: 1; }
    .period-value { min-width: 50px; font-weight: bold; color: #333; }
    .top-rec {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .trophy { font-size: 3rem; }
    .top-rec h3 { margin: 0 0 4px; color: #333; }
    .top-rec p { margin: 0; color: #666; }
    .bottom-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
  `]
})
export class StatsComponent implements OnInit {
  private checkinService = inject(CheckinService);

  stats: UserStatsResponse | null = null;
  loading = true;

  ngOnInit(): void {
    this.checkinService.obtenerEstadisticas().subscribe({
      next: data => { this.stats = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getColor(val: number): 'primary' | 'accent' | 'warn' {
    if (val <= 3) return 'primary';
    if (val <= 6) return 'accent';
    return 'warn';
  }
}