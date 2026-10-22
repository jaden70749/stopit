# HachaBell

학교나 일상에서 대중교통을 이용할 때 목적지에 가까워지면 알려주는 하차 알림 앱입니다.

## 1차 기능

- React 기반 화면
- 카카오맵 JavaScript SDK 연동
- 장소·정류장 검색
- GPS 현재 위치 확인
- 버스·지하철 경로 요약
- 즐겨찾기
- 하차 거리 설정 및 소리·진동 알림

실시간 버스 도착 정보와 실제 카카오 대중교통 경로 API는 카카오 Developers 앱을 만든 뒤 서버 프록시로 연결합니다.

## 실행

```bash
npm run build
npm run serve
```

브라우저에서 `http://localhost:4173`을 엽니다. 로컬 `.env`에는 공개 클라이언트 키인 `KAKAO_JAVASCRIPT_KEY`만 사용합니다.

## 배포

정적 호스팅의 빌드 명령은 `npm run build`, 결과 디렉터리는 `dist`입니다. 배포 환경변수에 `KAKAO_JAVASCRIPT_KEY`를 등록하면 빌드 시 `dist/config.js`에 주입됩니다.
# 실제 대중교통 경로 조회

Node.js 22 이상에서 실행합니다. 루트 `.env`에 `KAKAO_REST_API_KEY`(서버 전용)와
`KAKAO_JAVASCRIPT_KEY`(지도 표시용)를 설정한 뒤 `npm run dev`를 실행하면
http://localhost:4173 에서 지도와 `/api/transit` 서버를 함께 사용할 수 있습니다.
목적지를 선택하고 **대중교통 경로 조회**를 누르면 실제 경로 목록과 구간별 안내가 표시됩니다.
경로를 선택하면 제공된 좌표로 지도에 이동 구간을 그립니다.

GitHub Pages는 정적 파일만 제공하므로 REST API 서버를 실행하지 않습니다.
Vercel 배포를 위한 `api/transit.mjs`, `vercel.json`을 포함했습니다.
프로젝트 환경변수에 위 두 키를 등록하고 배포하면 같은 도메인에서 API를 호출합니다.
카카오 JavaScript 키의 허용 도메인에도 실제 배포 도메인을 등록해야 합니다.
프런트엔드를 Pages에 유지하고 서버만 별도 배포하려면 CORS 허용 설정을 추가해야 합니다.
REST 키는 `config.js`에 넣지 않으며 `.env`는 Git에 포함하지 않습니다.

