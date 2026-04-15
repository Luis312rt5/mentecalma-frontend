import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckInRequest, CheckInResponse } from '../models/checkin.model';
import { UserStatsResponse } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class CheckinService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  realizarCheckIn(req: CheckInRequest): Observable<CheckInResponse> {
    return this.http.post<CheckInResponse>(`${this.baseUrl}/checkin`, req);
  }

  obtenerHistorial(): Observable<CheckInResponse[]> {
    return this.http.get<CheckInResponse[]>(`${this.baseUrl}/checkin/history`);
  }

  logHabito(checkInId: number, recomendacionId: number,
            completado: boolean, efectividad?: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/habits/log`, {
      checkInId, recomendacionId, completado, efectividad
    });
  }

  obtenerEstadisticas(): Observable<UserStatsResponse> {
    return this.http.get<UserStatsResponse>(`${this.baseUrl}/stats/me`);
  }

  obtenerRecomendacionesPorCheckIn(checkInId: number): Observable<CheckInResponse> {
    return this.http.get<CheckInResponse>(`${this.baseUrl}/checkin/${checkInId}/recommendations`);
  }
}
