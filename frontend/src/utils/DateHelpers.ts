/**
 * Formata uma data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
 * sem problemas de timezone
 */
export function formatDateBR(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  // Se já está no formato ISO (YYYY-MM-DD)
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }
  
  return dateString;
}

/**
 * Adiciona dias a uma data sem problemas de timezone
 */
export function addDaysToDate(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  
  return `${newYear}-${newMonth}-${newDay}`;
}

/**
 * Converte Date object para formato ISO (YYYY-MM-DD) sem timezone
 */
export function dateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
