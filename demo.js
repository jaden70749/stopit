// Replay only coordinates from the selected real transit route.
function meters(a, b) {
  const rad = Math.PI / 180;
  const v = Math.sin((b.lat - a.lat) * rad / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lng - a.lng) * rad / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}
export function createReplay(route) {
  const steps = route?.steps || [];
  let last = -1;
  steps.forEach((s, i) => { if (['BUS', 'SUBWAY'].includes(s.properties?.type)) last = i; });
  if (last < 0) return null;
  const segments = [];
  let total = 0;
  for (const step of steps.slice(0, last + 1)) {
    const points = (step.path?.points || []).filter(p => Array.isArray(p) && p.length >= 2 && p.every(Number.isFinite)).map(([lng, lat]) => ({ lng, lat }));
    for (let i = 1; i < points.length; i++) {
      const length = meters(points[i - 1], points[i]);
      if (!length) continue;
      segments.push({ a: points[i - 1], b: points[i], start: total, length });
      total += length;
    }
  }
  if (!segments.length) return null;
  const stops = steps[last].properties?.stops || [];
  return { segments, total, target: { ...segments[segments.length - 1].b, name: stops[stops.length - 1]?.name || '선택 경로 하차 지점' } };
}
export function replayPosition(replay, progress) {
  const distance = Math.max(0, Math.min(1, progress)) * replay.total;
  const s = replay.segments.find(s => distance <= s.start + s.length) || replay.segments[replay.segments.length - 1];
  const t = Math.min(1, Math.max(0, (distance - s.start) / s.length));
  return { lat: s.a.lat + (s.b.lat - s.a.lat) * t, lng: s.a.lng + (s.b.lng - s.a.lng) * t };
}
