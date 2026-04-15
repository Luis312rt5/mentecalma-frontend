export interface Recomendacion {
  id?: number;
  titulo: string;
  tipo: string;
  descripcion: string;
  duracionMin: number;
  prioridad: number;
  contenidoJson?: string;
  activa: boolean;
}

export interface Regla {
  id?: number;
  nombre: string;
  condicionesJson: string;
  recomendacion: Recomendacion;
  prioridad: number;
  activa: boolean;
  version?: number;
}