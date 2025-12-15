// Get today's date in Eastern time
export function getTodayEasternDate(): string {
  const now = new Date();
  const easternDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const year = easternDate.getFullYear();
  const month = String(easternDate.getMonth() + 1).padStart(2, '0');
  const day = String(easternDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get today's date object in Eastern time (for comparisons)
export function getTodayEasternDateObject(): Date {
  const now = new Date();
  const easternDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  easternDate.setHours(0, 0, 0, 0);
  return easternDate;
}

