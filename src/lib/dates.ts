/** Date helpers that work on plain YYYY-MM-DD strings to avoid timezone surprises. */

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysUntil(iso: string | undefined | null): number | null {
  if (!iso) return null;
  const target = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date(`${todayISO()}T00:00:00`);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

export function describeDue(iso: string | undefined | null): string {
  const d = daysUntil(iso);
  if (d === null) return 'No date';
  if (d < -1) return `${Math.abs(d)} days overdue`;
  if (d === -1) return 'Yesterday';
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d <= 60) return `In ${d} days`;
  return `In ${Math.round(d / 30)} months`;
}

export function isValidISODate(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(new Date(`${iso}T00:00:00`).getTime());
}
