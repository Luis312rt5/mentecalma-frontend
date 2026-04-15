export interface UserStatsResponse {
  totalCheckins: number;
  promedioEstresUltimos7Dias: number;
  promedioEstresUltimos30Dias: number;
  habitosCompletados: number;
  recomendacionMasEfectiva: string;
  efectividadPromedio: number;
  rachaActualDias: number;
}