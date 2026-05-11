export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

export function fmtMonth(iso: string): string {
  const [y, m] = iso.split("-");
  return `${y}.${m}`;
}
