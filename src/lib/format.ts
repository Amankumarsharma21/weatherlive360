export function citySlug(name: string, country: string) {
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${norm(name)}-${country.toLowerCase()}`;
}

export function parseCitySlug(slug: string) {
  const parts = slug.split("-");
  const country = parts.pop()?.toUpperCase() ?? "";
  const name = parts.join(" ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { name, country };
}

export function formatTime(unix: number, tzOffsetSec: number) {
  const d = new Date((unix + tzOffsetSec) * 1000);
  return d.toUTCString().slice(17, 22);
}

export function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function owmIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
