import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../core/services/admin.service';
import { Regla, Recomendacion } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule,
    MatDialogModule, MatSnackBarModule, MatTabsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-container">
      <div class="page-header">
        <mat-icon>admin_panel_settings</mat-icon>
        <h1>Panel de Administración</h1>
        <p>Gestiona reglas y recomendaciones del sistema experto</p>
      </div>

      <mat-tab-group>

        <!-- Tab Reglas -->
        <mat-tab label="📋 Reglas">
          <div class="tab-content">

            <!-- Formulario nueva regla -->
            <mat-card class="form-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>add_circle</mat-icon>
                  {{ editandoRegla ? 'Editar regla' : 'Nueva regla' }}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="reglaForm" (ngSubmit)="guardarRegla()">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="flex-2">
                      <mat-label>Nombre de la regla</mat-label>
                      <input matInput formControlName="nombre">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Prioridad</mat-label>
                      <input matInput type="number" formControlName="prioridad" min="1" max="10">
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Condiciones JSON</mat-label>
                    <textarea matInput formControlName="condicionesJson" rows="3"
                      placeholder='[{"campo":"nivelEstres","operador":"GREATER_THAN","valor":"6"}]'>
                    </textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Recomendación</mat-label>
                    <mat-select formControlName="recomendacionId">
                      <mat-option *ngFor="let r of recomendaciones" [value]="r.id">
                        {{ r.titulo }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit"
                            [disabled]="reglaForm.invalid || loadingRegla">
                      <mat-spinner diameter="18" *ngIf="loadingRegla"></mat-spinner>
                      <span *ngIf="!loadingRegla">
                        {{ editandoRegla ? 'Actualizar' : 'Crear regla' }}
                      </span>
                    </button>
                    <button mat-stroked-button type="button"
                            *ngIf="editandoRegla" (click)="cancelarEdicionRegla()">
                      Cancelar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Tabla de reglas -->
            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Reglas activas ({{ reglas.length }})</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="loading" *ngIf="loadingTabla">
                  <mat-spinner diameter="36"></mat-spinner>
                </div>
                <table mat-table [dataSource]="reglas" *ngIf="!loadingTabla">
                  <ng-container matColumnDef="nombre">
                    <th mat-header-cell *matHeaderCellDef>Nombre</th>
                    <td mat-cell *matCellDef="let r">{{ r.nombre }}</td>
                  </ng-container>
                  <ng-container matColumnDef="prioridad">
                    <th mat-header-cell *matHeaderCellDef>Prioridad</th>
                    <td mat-cell *matCellDef="let r">
                      <mat-chip>{{ r.prioridad }}</mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="recomendacion">
                    <th mat-header-cell *matHeaderCellDef>Recomendación</th>
                    <td mat-cell *matCellDef="let r">{{ r.recomendacion?.titulo }}</td>
                  </ng-container>
                  <ng-container matColumnDef="activa">
                    <th mat-header-cell *matHeaderCellDef>Activa</th>
                    <td mat-cell *matCellDef="let r">
                      <mat-slide-toggle
                        [checked]="r.activa"
                        (change)="toggleRegla(r, $event.checked)">
                      </mat-slide-toggle>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let r">
                      <button mat-icon-button color="primary" (click)="editarRegla(r)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="eliminarRegla(r.id)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="colsReglas"></tr>
                  <tr mat-row *matRowDef="let row; columns: colsReglas;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab Recomendaciones -->
        <mat-tab label="💡 Recomendaciones">
          <div class="tab-content">

            <!-- Formulario nueva recomendación -->
            <mat-card class="form-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>add_circle</mat-icon>
                  {{ editandoRec ? 'Editar recomendación' : 'Nueva recomendación' }}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="recForm" (ngSubmit)="guardarRecomendacion()">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="flex-2">
                      <mat-label>Título</mat-label>
                      <input matInput formControlName="titulo">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Tipo</mat-label>
                      <mat-select formControlName="tipo">
                        <mat-option value="RESPIRACION">🌬️ Respiración</mat-option>
                        <mat-option value="MEDITACION">🧘 Meditación</mat-option>
                        <mat-option value="PAUSA_ACTIVA">🚶 Pausa activa</mat-option>
                        <mat-option value="EJERCICIO">💪 Ejercicio</mat-option>
                        <mat-option value="HIGIENE_SUENO">😴 Higiene sueño</mat-option>
                        <mat-option value="HABITO">✅ Hábito</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Descripción</mat-label>
                    <textarea matInput formControlName="descripcion" rows="2"></textarea>
                  </mat-form-field>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Duración (min)</mat-label>
                      <input matInput type="number" formControlName="duracionMin">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Prioridad</mat-label>
                      <input matInput type="number" formControlName="prioridad">
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit"
                            [disabled]="recForm.invalid || loadingRec">
                      <mat-spinner diameter="18" *ngIf="loadingRec"></mat-spinner>
                      <span *ngIf="!loadingRec">
                        {{ editandoRec ? 'Actualizar' : 'Crear recomendación' }}
                      </span>
                    </button>
                    <button mat-stroked-button type="button"
                            *ngIf="editandoRec" (click)="cancelarEdicionRec()">
                      Cancelar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Tabla recomendaciones -->
            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Recomendaciones ({{ recomendaciones.length }})</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="recomendaciones">
                  <ng-container matColumnDef="titulo">
                    <th mat-header-cell *matHeaderCellDef>Título</th>
                    <td mat-cell *matCellDef="let r">{{ r.titulo }}</td>
                  </ng-container>
                  <ng-container matColumnDef="tipo">
                    <th mat-header-cell *matHeaderCellDef>Tipo</th>
                    <td mat-cell *matCellDef="let r">
                      <mat-chip>{{ r.tipo }}</mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="duracion">
                    <th mat-header-cell *matHeaderCellDef>Duración</th>
                    <td mat-cell *matCellDef="let r">{{ r.duracionMin }} min</td>
                  </ng-container>
                  <ng-container matColumnDef="prioridad">
                    <th mat-header-cell *matHeaderCellDef>Prioridad</th>
                    <td mat-cell *matCellDef="let r">{{ r.prioridad }}</td>
                  </ng-container>
                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let r">
                      <button mat-icon-button color="primary" (click)="editarRec(r)">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="colsRecs"></tr>
                  <tr mat-row *matRowDef="let row; columns: colsRecs;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1000px;
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
    .tab-content { padding: 1.5rem 0; }
    .form-card { margin-bottom: 1.5rem; border-radius: 12px; }
    .form-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .table-card { border-radius: 12px; overflow: hidden; }
    .form-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .full-width { width: 100%; }
    .flex-1 { flex: 1; min-width: 150px; }
    .flex-2 { flex: 2; min-width: 200px; }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    table { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 2rem; }
  `]
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  reglas: Regla[] = [];
  recomendaciones: Recomendacion[] = [];
  loadingTabla = true;
  loadingRegla = false;
  loadingRec = false;
  editandoRegla: Regla | null = null;
  editandoRec: Recomendacion | null = null;

  colsReglas = ['nombre', 'prioridad', 'recomendacion', 'activa', 'acciones'];
  colsRecs = ['titulo', 'tipo', 'duracion', 'prioridad', 'acciones'];

  reglaForm = this.fb.group({
    nombre: ['', Validators.required],
    condicionesJson: ['', Validators.required],
    recomendacionId: [null, Validators.required],
    prioridad: [5, [Validators.required, Validators.min(1), Validators.max(10)]]
  });

  recForm = this.fb.group({
    titulo: ['', Validators.required],
    tipo: ['', Validators.required],
    descripcion: ['', Validators.required],
    duracionMin: [5, Validators.required],
    prioridad: [5, Validators.required]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loadingTabla = true;
    this.adminService.listarRecomendaciones().subscribe(recs => {
      this.recomendaciones = recs;
      this.adminService.listarReglas().subscribe(reglas => {
        this.reglas = reglas;
        this.loadingTabla = false;
      });
    });
  }

  guardarRegla(): void {
    if (this.reglaForm.invalid) return;
    this.loadingRegla = true;
    const val = this.reglaForm.value;
    const rec = this.recomendaciones.find(r => r.id === val.recomendacionId);
    if (!rec) return;

    const regla: Regla = {
      nombre: val.nombre!,
      condicionesJson: val.condicionesJson!,
      recomendacion: rec,
      prioridad: val.prioridad!,
      activa: true
    };

    const op = this.editandoRegla
      ? this.adminService.actualizarRegla(this.editandoRegla.id!, regla)
      : this.adminService.crearRegla(regla);

    op.subscribe({
      next: () => {
        this.snackBar.open('Regla guardada', 'OK', { duration: 2000 });
        this.loadingRegla = false;
        this.cancelarEdicionRegla();
        this.cargarDatos();
      },
      error: () => { this.loadingRegla = false; }
    });
  }

  editarRegla(regla: Regla): void {
    this.editandoRegla = regla;
    this.reglaForm.patchValue({
      nombre: regla.nombre,
      condicionesJson: regla.condicionesJson,
      recomendacionId: regla.recomendacion?.id as any,
      prioridad: regla.prioridad
    });
  }

  cancelarEdicionRegla(): void {
    this.editandoRegla = null;
    this.reglaForm.reset({ prioridad: 5 });
  }

  toggleRegla(regla: Regla, activa: boolean): void {
    this.adminService.toggleRegla(regla.id!, activa).subscribe({
      next: () => this.snackBar.open(`Regla ${activa ? 'activada' : 'desactivada'}`, 'OK', { duration: 2000 }),
      error: () => {}
    });
  }

  eliminarRegla(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar esta regla?')) return;
    this.adminService.eliminarRegla(id).subscribe({
      next: () => {
        this.snackBar.open('Regla eliminada', 'OK', { duration: 2000 });
        this.cargarDatos();
      },
      error: () => {}
    });
  }

  guardarRecomendacion(): void {
    if (this.recForm.invalid) return;
    this.loadingRec = true;
    const rec: Recomendacion = { ...this.recForm.value as any, activa: true };

    const op = this.editandoRec
      ? this.adminService.actualizarRecomendacion(this.editandoRec.id!, rec)
      : this.adminService.crearRecomendacion(rec);

    op.subscribe({
      next: () => {
        this.snackBar.open('Recomendación guardada', 'OK', { duration: 2000 });
        this.loadingRec = false;
        this.cancelarEdicionRec();
        this.cargarDatos();
      },
      error: () => { this.loadingRec = false; }
    });
  }

  editarRec(rec: Recomendacion): void {
    this.editandoRec = rec;
    this.recForm.patchValue({
      titulo: rec.titulo,
      tipo: rec.tipo,
      descripcion: rec.descripcion,
      duracionMin: rec.duracionMin,
      prioridad: rec.prioridad
    });
  }

  cancelarEdicionRec(): void {
    this.editandoRec = null;
    this.recForm.reset({ duracionMin: 5, prioridad: 5 });
  }
}