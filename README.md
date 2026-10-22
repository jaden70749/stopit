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
