import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CheckInResponse, RecommendationResponse } from '../../core/models/checkin.model';
import { CheckinService } from '../../core/services/checkin.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="rec-container">

      <!-- Caso crítico -->
      <mat-card class="critico-card" *ngIf="resultado?.tipoResultado === 'CRITICO'">
        <mat-card-content>
          <mat-icon class="critico-icon">warning</mat-icon>
          <h2>Nivel de estrés crítico</h2>
          <p>{{ resultado?.mensajeCritico }}</p>
          <button mat-raised-button color="warn" routerLink="/dashboard">
            Volver al inicio
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Recomendaciones normales -->
      <ng-container *ngIf="resultado?.tipoResultado !== 'CRITICO'">
        <div class="header-section">
          <mat-icon class="header-icon">lightbulb</mat-icon>
          <h1>Tus recomendaciones</h1>
          <p>Basadas en tu check-in de hoy — {{ resultado?.fecha | date:'dd/MM/yyyy' }}</p>
          <div class="checkin-summary">
            <mat-chip>😰 Estrés: {{ resultado?.nivelEstres }}/10</mat-chip>
            <mat-chip>💼 {{ getSituacionLabel(resultado?.situacion) }}</mat-chip>
            <mat-chip>😴 {{ resultado?.horasSueno }}h de sueño</mat-chip>
          </div>
        </div>

        <!-- Sin coincidencias -->
        <mat-card *ngIf="resultado?.tipoResultado === 'SIN_COINCIDENCIAS'" class="no-match-card">
          <mat-card-content>
            <mat-icon>info</mat-icon>
            <p>No encontramos reglas específicas para tu situación. Te recomendamos continuar con tus rutinas habituales.</p>
          </mat-card-content>
        </mat-card>

        <!-- Lista de recomendaciones -->
        <div class="recs-list">
          <mat-card class="rec-card" *ngFor="let rec of resultado?.recomendaciones; let i = index">
            <mat-card-header>
              <div class="rec-header">
                <span class="rec-number">{{ i + 1 }}</span>
                <div class="rec-title-section">
                  <h2>{{ rec.titulo }}</h2>
                  <mat-chip class="tipo-chip" [class]="getTipoClass(rec.tipo)">
                    {{ getTipoIcon(rec.tipo) }} {{ rec.tipo }}
                  </mat-chip>
                </div>
                <div class="rec-meta">
                  <span><mat-icon>schedule</mat-icon> {{ rec.duracionMin }} min</span>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <p class="rec-descripcion">{{ rec.descripcion }}</p>

              <!-- Pasos si existen -->
              <div class="pasos-container" *ngIf="getPasos(rec)">
                <h4><mat-icon>format_list_numbered</mat-icon> Pasos:</h4>
                <ol>
                  <li *ngFor="let paso of getPasos(rec)">{{ paso }}</li>
                </ol>
              </div>

              <mat-divider></mat-divider>

              <!-- Regla que la activó -->
              <p class="regla-info">
                <mat-icon>rule</mat-icon>
                <strong>Por qué esta recomendación:</strong> {{ rec.reglaActivada }}
              </p>

              <!-- Marcar como completado -->
              <div class="actions-row">
                <button mat-stroked-button color="primary"
                        (click)="marcarCompletado(rec, true)"
                        [disabled]="completados.has(rec.id)">
                  <mat-icon>{{ completados.has(rec.id) ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                  {{ completados.has(rec.id) ? '¡Completado!' : 'Marcar como hecho' }}
                </button>

                <!-- Calificar efectividad -->
                <div class="efectividad" *ngIf="completados.has(rec.id)">
                  <span>¿Qué tan efectivo fue?</span>
                  <div class="estrellas">
                    <mat-icon *ngFor="let star of [1,2,3,4,5]"
                              (click)="calificar(rec, star)"
                              [class.filled]="(calificaciones.get(rec.id) || 0) >= star"
                              class="star">
                      {{ (calificaciones.get(rec.id) || 0) >= star ? 'star' : 'star_border' }}
                    </mat-icon>
                  </div>
                </div>
              </div>

            </mat-card-content>
          </mat-card>
        </div>

        <div class="bottom-actions">
          <button mat-raised-button color="primary" routerLink="/dashboard">
            <mat-icon>home</mat-icon>
            Volver al inicio
          </button>
          <button mat-stroked-button routerLink="/history">
            <mat-icon>history</mat-icon>
            Ver historial
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .rec-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ff9800;
    }
    .header-section h1 { color: #3f51b5; margin: 0.5rem 0; }
    .header-section p { color: #666; }
    .checkin-summary {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 1rem;
    }
    .recs-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .rec-card { border-radius: 12px; border-left: 4px solid #3f51b5; }
    .rec-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      width: 100%;
    }
    .rec-number {
      background: #3f51b5;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }
    .rec-title-section { flex: 1; }
    .rec-title-section h2 { margin: 0 0 8px; }
    .rec-meta {
      display: flex;
      align-items: center;
      color: #666;
      font-size: 0.9rem;
    }
    .rec-meta mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .rec-descripcion { color: #555; margin: 1rem 0; }
    .pasos-container { background: #f5f5f5; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    .pasos-container h4 {
      margin: 0 0 0.5rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .pasos-container ol { margin: 0; padding-left: 1.5rem; }
    .pasos-container li { margin: 4px 0; color: #444; }
    .regla-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.85rem;
      margin: 0.75rem 0 0;
    }
    .regla-info mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #9c27b0; }
    .actions-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .efectividad {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #666;
    }
    .estrellas { display: flex; }
    .star { cursor: pointer; color: #ccc; transition: color 0.2s; }
    .star.filled { color: #ff9800; }
    .critico-card {
      text-align: center;
      border: 2px solid #f44336;
      border-radius: 12px;
    }
    .critico-card mat-card-content { padding: 2rem; }
    .critico-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #f44336;
    }
    .no-match-card { text-align: center; }
    .no-match-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
    }
    .bottom-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
    .tipo-chip { font-size: 0.75rem; }
  `]
})
export class RecommendationsComponent implements OnInit {
  private router = inject(Router);
  private checkinService = inject(CheckinService);
  private snackBar = inject(MatSnackBar);

  resultado: CheckInResponse | null = null;
  completados = new Set<number>();
  calificaciones = new Map<number, number>();

  ngOnInit(): void {
  const state = history.state;
  if (state?.resultado) {
    this.resultado = state.resultado;
  } else {
    this.router.navigate(['/dashboard']);
  }
}

  marcarCompletado(rec: RecommendationResponse, completado: boolean): void {
    if (!this.resultado) return;
    this.completados.add(rec.id);
    this.checkinService.logHabito(this.resultado.checkInId, rec.id, completado).subscribe({
      next: () => this.snackBar.open('¡Hábito registrado!', 'OK', { duration: 2000 }),
      error: () => {}
    });
  }

  calificar(rec: RecommendationResponse, estrellas: number): void {
    if (!this.resultado) return;
    this.calificaciones.set(rec.id, estrellas);
    this.checkinService.logHabito(
      this.resultado.checkInId, rec.id, true, estrellas
    ).subscribe({
      next: () => this.snackBar.open(`Calificado con ${estrellas} estrellas`, 'OK', { duration: 2000 }),
      error: () => {}
    });
  }

  getPasos(rec: RecommendationResponse): string[] | null {
    if (!rec.contenidoJson) return null;
    try {
      const data = JSON.parse(rec.contenidoJson);
      return data.pasos || null;
    } catch { return null; }
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      RESPIRACION: '🌬️', MEDITACION: '🧘', PAUSA_ACTIVA: '🚶',
      EJERCICIO: '💪', HIGIENE_SUENO: '😴', HABITO: '✅'
    };
    return icons[tipo] || '💡';
  }

  getTipoClass(tipo: string): string {
    const classes: Record<string, string> = {
      RESPIRACION: 'chip-blue', MEDITACION: 'chip-purple',
      PAUSA_ACTIVA: 'chip-green', EJERCICIO: 'chip-orange',
      HIGIENE_SUENO: 'chip-navy', HABITO: 'chip-teal'
    };
    return classes[tipo] || '';
  }

  getSituacionLabel(situacion?: string): string {
    const labels: Record<string, string> = {
      TRABAJO: 'Trabajo', SUENO: 'Sueño', RELACIONES: 'Relaciones',
      ECONOMICO: 'Economía', SALUD: 'Salud', OTRO: 'Otro'
    };
    return labels[situacion || ''] || situacion || '';
  }
}