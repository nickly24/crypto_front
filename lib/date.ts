/**
 * Парсит дату с бэкенда. Бэкенд отдаёт UTC без суффикса Z
 * (напр. "2026-03-14T04:08:20"). JavaScript по умолчанию интерпретирует
 * такие строки как локальное время — добавляем Z, чтобы парсить как UTC.
 * Тогда toLocaleString покажет корректное время в часовом поясе устройства.
 */
export function parseBackendUtcDate(s: string | null | undefined): Date | null {
  if (!s || typeof s !== "string") return null;
  const trimmed = s.trim();
  if (!trimmed) return null;
  // Уже есть Z или смещение (+00:00, -05:30 и т.п.) — парсим как есть
  if (trimmed.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }
  // Бэкенд отдаёт UTC без суффикса — парсим как UTC
  return new Date(trimmed + "Z");
}

/** Форматирует дату с бэкенда в локальное время пользователя */
export function fmtBackendDate(s: string | null | undefined): string {
  const d = parseBackendUtcDate(s);
  return d ? d.toLocaleString("en-US") : "—";
}
