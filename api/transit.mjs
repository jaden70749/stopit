// The REST key stays on the server; never include it in public config.js.
export async function transit(params, key, fetcher = fetch) {
  const query = new URLSearchParams();
  for (const name of ['start_x', 'start_y', 'end_x', 'end_y']) {
    const raw = params.get(name);
    const value = Number(raw);
    const limit = name.endsWith('_x') ? 180 : 90;
    if (raw === null || raw.trim() === '' || !Number.isFinite(value) || Math.abs(value) > limit) {
      return { status: 400, body: { message: '출발지와 도착지 좌표를 확인해 주세요.' } };
    }
    query.set(name, String(value));
  }
  if (!key) return { status: 503, body: { message: '경로 조회 서버의 키 설정이 필요합니다.' } };
  try {
    const response = await fetcher(`https://dapi.kakao.com/v2/routing/publictraffic?${query}`, {
      headers: { Authorization: `KakaoAK ${key}` }, signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) return { status: 502, body: { message: '교통 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.' } };
    const data = await response.json();
    if (data.status !== 'OK') return { status: 200, body: { routes: [], message: '이 구간의 대중교통 경로를 찾지 못했어요.' } };
    return { status: 200, body: { routes: data.routes || [] } };
  } catch {
    return { status: 502, body: { message: '경로 조회 연결이 지연되고 있어요. 다시 시도해 주세요.' } };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.statusCode = 405; res.end(); return; }
  const result = await transit(new URL(req.url, 'http://localhost').searchParams, process.env.KAKAO_REST_API_KEY);
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(result.body));
}
