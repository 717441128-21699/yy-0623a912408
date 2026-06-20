export function formatTime(dateStr?: string | null): string {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}时${m}分`;
}

export function tempZoneLabel(zone: string): string {
  switch (zone) {
    case 'frozen': return '冷冻 -20℃';
    case 'chilled': return '冷藏 2-8℃';
    case 'constant': return '恒温 15℃';
    default: return zone;
  }
}

export function tempZoneShort(zone: string): string {
  switch (zone) {
    case 'frozen': return '冷冻';
    case 'chilled': return '冷藏';
    case 'constant': return '恒温';
    default: return zone;
  }
}

export function alertTypeLabel(type: string): string {
  switch (type) {
    case 'poweroff': return '制冷断电';
    case 'temp_high': return '温度偏高';
    case 'device_error': return '设备故障';
    default: return type;
  }
}
