import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CheckinService } from '../../core/services/checkin.service';
import { CheckInResponse } from '../../core/models/checkin.model';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatSliderModule, MatChipsModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="checkin-container">
      <mat-card class="checkin-card">
        <mat-card-header>
          <div class="header">
            <mat-icon class="header-icon">edit_note</mat-icon>
            <h1>Check-in del día</h1>
            <p>Cuéntanos cómo te sientes hoy</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Nivel de estrés -->
            <div class="form-section">
              <h3>¿Cuál es tu nivel de estrés? <span class="stress-value">{{ form.get('nivelEstres')?.value }}/10</span></h3>
              <mat-slider min="1" max="10" step="1" class="full-width stress-slider">
                <input matSliderThumb formControlName="nivelEstres">
              </mat-slider>
              <div class="stress-labels">
                <span>😌 Tranquilo</span>
                <span>😰 Muy estresado</span>
              </div>
            </div>

            <!-- Situación -->
            <div class="form-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>¿Qué situación te genera más estrés?</mat-label>
                <mat-select formControlName="situacion">
                  <mat-option value="TRABAJO">💼 Trabajo</mat-option>
                  <mat-option value="SUENO">😴 Sueño / Descanso</mat-option>
                  <mat-option value="RELACIONES">❤️ Relaciones</mat-option>
                  <mat-option value="ECONOMICO">💰 Economía</mat-option>
                  <mat-option value="SALUD">🏥 Salud</mat-option>
                  <mat-option value="OTRO">🔹 Otro</mat-option>
                </mat-select>
                <mat-error>Selecciona una situación</mat-error>
              </mat-form-field>
            </div>

            <!-- Horas de sueño -->
            <div class="form-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>¿Cuántas horas dormiste anoche?</mat-label>
                <input matInput type="number" formControlName="horasSueno"
                       min="0" max="24" step="0.5" placeholder="7.5">
                <mat-icon matSuffix>bedtime</mat-icon>
                <mat-error>Ingresa las horas de sueño (0-24)</mat-error>
              </mat-form-field>
            </div>

            <!-- Síntomas -->
            <div class="form-section">
              <h3>¿Tienes alguno de estos síntomas?</h3>
              <div class="chips-container">
                <mat-chip-listbox multiple>
                  <mat-chip-option *ngFor="let s of sintomasOpciones"
                    [value]="s.valor"
                    (selectionChange)="toggleSintoma(s.valor, $event.selected)">
                    {{ s.label }}
                  </mat-chip-option>
                </mat-chip-listbox>
              </div>
            </div>

            <!-- Notas -->
            <div class="form-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notas adicionales (opcional)</mat-label>
                <textarea matInput formControlName="notasLibres" rows="3"
                          placeholder="¿Algo más que quieras agregar?"></textarea>
                <mat-icon matSuffix>notes</mat-icon>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" class="full-width submit-btn"
                    type="submit" [disabled]="loading || form.invalid">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">
                <mat-icon>send</mat-icon>
                Enviar check-in
              </span>
            </button>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .checkin-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .checkin-card { border-radius: 16px; }
    .header {
      text-align: center;
      width: 100%;
      padding: 1rem 0;
    }
    .header-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #3f51b5;
    }
    .header h1 { margin: 0.5rem 0 0.25rem; color: #3f51b5; }
    .header p { color: #666; margin: 0; }
    .form-section { margin: 1.5rem 0; }
    .form-section h3 {
      color: #333;
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .stress-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3f51b5;
    }
    .full-width { width: 100%; }
    .stress-slider { width: 100%; }
    .stress-labels {
      display: flex;
      justify-content: space-between;
      color: #666;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    .chips-container { margin-top: 0.5rem; }
    mat-chip-option { margin: 4px; }
    .submit-btn {
      height: 52px;
      font-size: 1rem;
      margin-top: 1rem;
      border-radius: 26px;
    }
    .submit-btn mat-icon { margin-right: 8px; vertical-align: middle; }
  `]
})
export class CheckinComponent {
  private fb = inject(FormBuilder);
  private checkinService = inject(CheckinService);
  private router = inject(Router);

  loading = false;
  sintomasSeleccionados: string[] = [];

  sintomasOpciones = [
    { valor: 'dolor_cabeza', label: '🤕 Dolor de cabeza' },
    { valor: 'tension_muscular', label: '💪 Tensión muscular' },
    { valor: 'irritabilidad', label: '😠 Irritabilidad' },
    { valor: 'cansancio', label: '😴 Cansancio' },
    { valor: 'ansiedad', label: '😰 Ansiedad' },
    { valor: 'insomnio', label: '🌙 Insomnio' },
    { valor: 'tristeza', label: '😢 Tristeza' },
    { valor: 'concentracion', label: '🧠 Falta de concentración' }
  ];

  form = this.fb.group({
    nivelEstres: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    situacion: ['', Validators.required],
    horasSueno: [7, [Validators.required, Validators.min(0), Validators.max(24)]],
    notasLibres: ['']
  });

  toggleSintoma(valor: string, selected: boolean): void {
    if (selected) {
      this.sintomasSeleccionados.push(valor);
    } else {
      this.sintomasSeleccionados = this.sintomasSeleccionados.filter(s => s !== valor);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const req = {
      ...this.form.value,
      sintomas: this.sintomasSeleccionados
    } as any;

    this.checkinService.realizarCheckIn(req).subscribe({
      next: (res: CheckInResponse) => {
        this.router.navigate(['/recommendations', res.checkInId], {
          state: { resultado: res }
        });
      },
      error: () => { this.loading = false; }
    });
  }
}