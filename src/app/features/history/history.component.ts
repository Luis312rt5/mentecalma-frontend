import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { CheckinService } from '../../core/services/checkin.service';
import { CheckInResponse } from '../../core/models/checkin.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatExpansionModule
  ],
  template: `
    <div class="history-container">
      <div class="page-header">
        <mat-icon>history</mat-icon>
        <h1>Historial de Check-ins</h1>
        <p>Haz clic en un check-in para ver sus recomendaciones</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div class="empty-state" *ngIf="!loading && checkins.length === 0">
        <mat-icon>inbox</mat-icon>
        <h2>Sin registros aún</h2>
        <p>Aún no tienes check-ins registrados.</p>
        <button mat-raised-button color="primary" routerLink="/checkin">
          Hacer mi primer check-in
        </button>
      </div>

      <mat-accordion *ngIf="!loading && checkins.length > 0">
        <mat-expansion-panel *ngFor="let ci of checkins"
          (opened)="cargarRecomendaciones(ci)">

          <!-- Cabecera del check-in -->
          <mat-expansion-panel-header>
            <mat-panel-title>
              <div class="checkin-header">
                <mat-icon>calendar_today</mat-icon>
                <span class="fecha">{{ ci.fecha | date:'dd/MM/yyyy' }}</span>
                <span class="estres-badge" [class]="getEstresClass(ci.nivelEstres)">
                  😰 {{ ci.nivelEstres }}/10
                </span>
                <mat-chip class="situacion-chip">{{ getSituacionLabel(ci.situacion) }}</mat-chip>
                <span class="sueno">
                  <mat-icon>bedtime</mat-icon> {{ ci.horasSueno }}h
                </span>
              </div>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <!-- Contenido expandido: recomendaciones -->
          <div class="recs-content">
            <div class="loading-recs" *ngIf="loadingRecs.has(ci.checkInId)">
              <mat-spinner diameter="32"></mat-spinner>
              <span>Cargando recomendaciones...</span>
            </div>

            <div *ngIf="recsMap.has(ci.checkInId) && !loadingRecs.has(ci.checkInId)">
  <div *ngIf="ci.nivelEstres >= 9" class="critico-msg">
    <mat-icon>warning</mat-icon>
    <span>Nivel de estrés crítico. Te recomendamos hablar con un profesional.
    Línea 106 (Colombia) — atención gratuita las 24 horas.</span>
  </div>
  <div *ngIf="recsMap.get(ci.checkInId)!.length === 0 && ci.nivelEstres < 9" class="no-recs">
    <mat-icon>info</mat-icon>
    <span>No hay recomendaciones registradas para este check-in.</span>
  </div>

              <div class="rec-item" *ngFor="let rec of recsMap.get(ci.checkInId); let i = index">
                <div class="rec-numero">{{ i + 1 }}</div>
                <div class="rec-info">
                  <h4>{{ rec.titulo }}</h4>
                  <p>{{ rec.descripcion }}</p>
                  <div class="rec-meta">
                    <mat-chip>{{ rec.tipo }}</mat-chip>
                    <span><mat-icon>schedule</mat-icon> {{ rec.duracionMin }} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </mat-expansion-panel>
      </mat-accordion>

      <div class="fab-container">
        <button mat-fab color="primary" routerLink="/checkin">
          <mat-icon>add</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
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
    .checkin-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .checkin-header mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      color: #3f51b5;
    }
    .fecha { font-weight: 500; color: #333; }
    .estres-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .estres-badge.bajo { background: #e8f5e9; color: #2e7d32; }
    .estres-badge.medio { background: #fff3e0; color: #e65100; }
    .estres-badge.alto { background: #ffebee; color: #c62828; }
    .sueno {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 0.9rem;
    }
    .sueno mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
    .recs-content { padding: 1rem 0; }
    .loading-recs {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      color: #666;
    }
    .no-recs {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #999;
      padding: 1rem;
    }
    .rec-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-left: 3px solid #3f51b5;
      margin-bottom: 1rem;
      background: #f8f9ff;
      border-radius: 0 8px 8px 0;
    }
    .rec-numero {
      background: #3f51b5;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }
    .rec-info h4 { margin: 0 0 4px; color: #333; }
    .rec-info p { margin: 0 0 8px; color: #666; font-size: 0.9rem; }
    .rec-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .rec-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 0.85rem;
    }
    .rec-meta mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
    .fab-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
    }
    .empty-state mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
    }
    .empty-state h2 { color: #999; }
    .empty-state p { color: #bbb; }
    .critico-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c62828;
  background: #ffebee;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #f44336;
}
.critico-msg mat-icon { color: #f44336; }
  `]
})
export class HistoryComponent implements OnInit {
  private checkinService = inject(CheckinService);

  checkins: CheckInResponse[] = [];
  loading = true;
  recsMap = new Map<number, any[]>();
  loadingRecs = new Set<number>();

  ngOnInit(): void {
    this.checkinService.obtenerHistorial().subscribe({
      next: data => { this.checkins = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  cargarRecomendaciones(ci: CheckInResponse): void {
  if (this.recsMap.has(ci.checkInId)) return;
  this.loadingRecs.add(ci.checkInId);

  this.checkinService.obtenerRecomendacionesPorCheckIn(ci.checkInId).subscribe({
    next: (res: CheckInResponse) => {
      this.recsMap.set(ci.checkInId, res.recomendaciones);
      this.loadingRecs.delete(ci.checkInId);
    },
    error: () => { this.loadingRecs.delete(ci.checkInId); }
  });
}

  getEstresClass(nivel: number): string {
    if (nivel <= 3) return 'bajo';
    if (nivel <= 6) return 'medio';
    return 'alto';
  }

  getSituacionLabel(situacion: string): string {
    const labels: Record<string, string> = {
      TRABAJO: '💼 Trabajo', SUENO: '😴 Sueño',
      RELACIONES: '❤️ Relaciones', ECONOMICO: '💰 Economía',
      SALUD: '🏥 Salud', OTRO: '🔹 Otro'
    };
    return labels[situacion] || situacion;
  }
}