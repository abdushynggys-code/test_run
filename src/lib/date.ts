export function toDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date: Date, firstDay: 0 | 1 = 1) {
  const result = new Date(date);
  const offset = (result.getDay() - firstDay + 7) % 7;
  result.setDate(result.getDate() - offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function monthGrid(date: Date, firstDay: 0 | 1 = 1) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(first, firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export function isSameDay(left: Date, right: Date) {
  return toDateKey(left) === toDateKey(right);
}

export function eventIncludesDay(startValue: string, endValue: string, day: Date) {
  const key = toDateKey(day);
  return key >= toDateKey(new Date(startValue)) && key <= toDateKey(new Date(endValue));
}
