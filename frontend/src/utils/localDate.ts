const APP_TIME_ZONE = "Asia/Jakarta";

function dateParts(value: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: map.year,
    month: map.month,
    day: map.day,
  };
}

export function todayIso(value: Date = new Date()) {
  const { year, month, day } = dateParts(value);
  return `${year}-${month}-${day}`;
}

export function currentMonthIso(value: Date = new Date()) {
  const { year, month } = dateParts(value);
  return `${year}-${month}`;
}

export function addDaysIso(dateText: string, days: number) {
  const [year, month, day] = String(dateText || todayIso())
    .slice(0, 10)
    .split("-")
    .map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}
