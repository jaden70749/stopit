// Fixed, explicitly simulated route. No timetable or real bus service is claimed.
export const DEMO_START = { lat: 37.39477, lng: 127.11119 };
export const DEMO_DESTINATION = { id: 'demo-stop', name: '시연 도착 정류장', address: '발표용 가상 정류장 · 실제 운행 정보 아님', lat: 37.4135, lng: 127.1245 };
export const DEMO_POINTS = [[127.11119, 37.39477], [127.115, 37.399], [127.12, 37.404], [127.1245, 37.4135]];
export function demoPosition(progress) {
  const p = Math.max(0, Math.min(1, progress)) * (DEMO_POINTS.length - 1);
  const i = Math.min(Math.floor(p), DEMO_POINTS.length - 2);
  const t = p - i;
  const a = DEMO_POINTS[i], b = DEMO_POINTS[i + 1];
  return { lng: a[0] + (b[0] - a[0]) * t, lat: a[1] + (b[1] - a[1]) * t };
}
export const DEMO_ROUTE = {
  properties: { type: 'BUS', totalTime: 600, transfers: 0, totalDistance: 2400 },
  steps: [{ properties: { type: 'BUS', guidance: '시연 버스 99 · 가상 노선', time: 600, distance: 2400,
    vehicles: [{ name: '시연 99', type: '가상 노선' }], stops: [{ name: '시연 출발 정류장' }, { name: '시연 중간 정류장' }, { name: '시연 도착 정류장' }] }, path: { points: DEMO_POINTS } }]
};
