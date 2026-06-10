// Returns today's date as "YYYY-MM-DD" in Eastern time
export function getTodayEasternDate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

// Returns midnight local-time for the Eastern calendar date — safe for YYYY-MM-DD string comparisons
export function getTodayEasternDateObject(): Date {
  const [year, month, day] = getTodayEasternDate().split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Returns the Sunday of the current Eastern week as "YYYY-MM-DD"
export function getWeekStartEasternDate(): string {
  const [year, month, day] = getTodayEasternDate().split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - date.getDay());
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
