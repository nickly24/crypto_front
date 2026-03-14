/**
 * Конвертирует UTC Unix timestamp в значение, которое Lightweight Charts
 * отобразит как локальное время пользователя.
 * Библиотека показывает время в UTC — сдвигаем метки, чтобы на оси
 * отображалось время по часовому поясу устройства.
 */
export function utcToLocalChartTime(utcSeconds: number): number {
  const d = new Date(utcSeconds * 1000);
  return (
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    ) / 1000
  );
}

/** То же для миллисекунд (ISO string или ms) */
export function utcMsToLocalChartTime(ms: number | string): number {
  const utcSec = typeof ms === "string" ? new Date(ms).getTime() / 1000 : ms / 1000;
  return utcToLocalChartTime(utcSec);
}
