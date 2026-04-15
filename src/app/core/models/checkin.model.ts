export type Situacion = 'TRABAJO' | 'SUENO' | 'RELACIONES' | 'ECONOMICO' | 'SALUD' | 'OTRO';

export interface CheckInRequest {
  nivelEstres: number;
  situacion: Situacion;
  horasSueno: number;
  sintomas?: string[];
  notasLibres?: string;
}

export interface RecommendationResponse {
  id: number;
  titulo: string;
  tipo: string;
  descripcion: string;
  duracionMin: number;
  contenidoJson?: string;
  reglaActivada: string;
}

export interface CheckInResponse {
  checkInId: number;
  fecha: string;
  nivelEstres: number;
  situacion: Situacion;
  horasSueno: number;
  tipoResultado: string;
  mensajeCritico?: string;
  recomendaciones: RecommendationResponse[];
}