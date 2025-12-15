/**
 * Formata data para padrão brasileiro (dd/mm/yyyy)
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString + 'T00:00:00') : dateString;
  return date.toLocaleDateString('pt-BR');
}

/**
 * Retorna o primeiro dia do mês atual
 */
export function getFirstDayOfMonth(): string {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
}

/**
 * Retorna o último dia do mês atual
 */
export function getLastDayOfMonth(): string {
  const date = new Date();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
}

/**
 * Retorna data de hoje no formato yyyy-mm-dd
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}