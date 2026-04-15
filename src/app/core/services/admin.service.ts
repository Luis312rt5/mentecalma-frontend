import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Regla, Recomendacion } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/admin';

  listarReglas(): Observable<Regla[]> {
    return this.http.get<Regla[]>(`${this.baseUrl}/rules`);
  }

  crearRegla(regla: Regla): Observable<Regla> {
    return this.http.post<Regla>(`${this.baseUrl}/rules`, regla);
  }

  actualizarRegla(id: number, regla: Regla): Observable<Regla> {
    return this.http.put<Regla>(`${this.baseUrl}/rules/${id}`, regla);
  }

  toggleRegla(id: number, activa: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/rules/${id}/toggle?activa=${activa}`, {});
  }

  eliminarRegla(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rules/${id}`);
  }

  listarRecomendaciones(): Observable<Recomendacion[]> {
    return this.http.get<Recomendacion[]>(`${this.baseUrl}/recommendations`);
  }

  crearRecomendacion(rec: Recomendacion): Observable<Recomendacion> {
    return this.http.post<Recomendacion>(`${this.baseUrl}/recommendations`, rec);
  }

  actualizarRecomendacion(id: number, rec: Recomendacion): Observable<Recomendacion> {
    return this.http.put<Recomendacion>(`${this.baseUrl}/recommendations/${id}`, rec);
  }
}