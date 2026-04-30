# Frontend 규칙

이 디렉터리는 BidRush 프론트엔드를 Next.js로 개발할 때 따라야 하는 규칙을 정의한다.

기준:

- 제품 기준: `docs/design.md`
- UI/UX 기준: `docs/frontend-ui-ux-guide.md`
- 프레임워크 기준: Next.js App Router 최신 공식 문서
- 확인일: 2026-04-30
- 확인한 Next.js 문서 최신 버전: 16.2.4

## 문서 목록

| 문서 | 목적 |
|:---|:---|
| `nextjs-app-router.md` | App Router, 라우팅, Server/Client Component 경계 |
| `rendering-data.md` | 데이터 패칭, 캐싱, Route Handler, API 클라이언트 |
| `realtime-state.md` | WebSocket, 입찰 상태, 서버 권위 상태 관리 |
| `ui-design-system.md` | 디자인 토큰, 컴포넌트, 화면 UX |
| `forms-errors-auth.md` | 폼, 오류, 인증, 환경 변수 |
| `performance-accessibility.md` | 이미지, 폰트, 접근성, 로딩, 메타데이터 |
| `testing.md` | 단위, 컴포넌트, E2E, 수동 QA |

## 공통 원칙

- 프론트엔드는 BidRush 경매 상태를 빠르고 신뢰 가능하게 보여줘야 한다.
- 현재가, 남은 시간, 최고 입찰자, 내 입찰 상태, 연결 상태는 모든 경매방 UI의 핵심이다.
- 서버가 경매 상태의 단일 진실 공급원이다. 클라이언트는 서버 확정 전 상태를 확정처럼 보여주면 안 된다.
- Next.js App Router를 기본으로 사용한다.
- Server Component를 기본값으로 두고, 상호작용이 필요한 지점만 Client Component로 만든다.
- API 계약은 백엔드 OpenAPI와 동기화한다.
- 새 UI는 접근성, 반응형, 로딩, 오류, 테스트를 함께 갖춰야 한다.

## 근거 문서

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js Mutating Data](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Next.js Forms](https://nextjs.org/docs/app/guides/forms)
- [Next.js Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [Next.js CSS](https://nextjs.org/docs/app/getting-started/css)
- [Next.js Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Next.js Authentication](https://nextjs.org/docs/app/guides/authentication)
- [Next.js ESLint](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Next.js Playwright](https://nextjs.org/docs/app/guides/testing/playwright)
- [Next.js Vitest](https://nextjs.org/docs/app/guides/testing/vitest)

## 리뷰 체크리스트

- App Router 파일 규칙을 따르는가?
- Server Component와 Client Component 경계가 최소화되어 있는가?
- `use client`가 필요한 파일에만 있는가?
- 서버 전용 비밀값이 브라우저 번들로 노출되지 않는가?
- 경매 snapshot, WebSocket 이벤트, 재연결 동기화가 일관적인가?
- 입찰 pending, accepted, rejected, outbid 상태가 UI에서 구분되는가?
- 로딩, 빈 화면, 오류, 접근성 상태가 빠짐없이 있는가?
- 이미지, 폰트, CSS가 Next.js 최적화 방식에 맞는가?
- 단위, 컴포넌트, E2E 테스트가 변경 위험에 맞게 추가됐는가?
