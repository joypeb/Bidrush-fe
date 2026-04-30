# Frontend Testing 규칙

## 기본 원칙

- 테스트는 사용자가 경매 상태를 믿고 입찰할 수 있는지를 검증해야 한다.
- 단위 테스트, 컴포넌트 테스트, E2E 테스트를 변경 위험에 맞게 선택한다.
- async Server Component는 단위 테스트보다 E2E로 검증하는 것을 우선 검토한다.
- 실시간 경매는 WebSocket mock과 재연결 시나리오를 포함해야 한다.
- 테스트 실패를 숨기기 위해 assertion을 약화하거나 skip하는 것을 금지한다.

근거: Next.js Vitest 문서는 async Server Components는 React 생태계에서 새롭기 때문에 Vitest가 현재 지원하지 않으며, async component는 E2E 테스트를 권장한다고 설명한다.

## 단위 테스트

대상:

- `formatCurrency`
- `formatRemainingTime`
- 서버 시간 offset 계산
- 입찰 금액 검증
- 경매 room reducer
- WebSocket 이벤트 deduplication
- Problem Details 오류 매핑

도구:

- Vitest
- React Testing Library

## 컴포넌트 테스트

대상:

- `AuctionCard` 상태별 표시
- `CountdownTimer` 종료 임박, 종료, 연장 표시
- `BidPanel` pending, accepted, rejected, outbid, offline 상태
- `ChatPanel` 새 메시지 버튼과 시스템 메시지
- `ConnectionStatus`
- 판매 등록 `FormField` 오류 표시

규칙:

- 사용자가 보는 텍스트와 role 중심으로 검증한다.
- CSS class 이름만으로 동작을 검증하지 않는다.
- 접근성 label과 keyboard interaction을 함께 확인한다.

## E2E 테스트

도구:

- Playwright

필수 시나리오:

1. 경매 목록 조회 후 경매방 입장
2. 로그인 필요 상태에서 입찰 시 로그인 유도
3. 입찰 성공 후 현재가 갱신
4. 더 높은 입찰 이벤트 수신 시 outbid 표시
5. 종료 임박 입찰로 자동 연장 표시
6. WebSocket 연결 끊김과 재연결
7. 판매 등록 폼 검증 실패
8. 판매 등록 성공 후 경매방 이동
9. 없는 경매 접근 시 not-found 또는 목록 이동 표시
10. 모바일 viewport에서 입찰 패널과 채팅 입력이 겹치지 않음

## Mock 전략

- REST API는 MSW 또는 Playwright route mock을 사용한다.
- WebSocket은 테스트 전용 adapter를 두고 이벤트를 주입할 수 있게 한다.
- 시간 관련 테스트는 fake timer 또는 고정 server time을 사용한다.
- 실제 백엔드 통합 E2E는 별도 profile로 분리한다.

## 수동 QA

- 360px 모바일에서 버튼 텍스트가 잘리지 않는다.
- 경매방에서 현재가와 남은 시간을 1초 안에 이해할 수 있다.
- 가격 갱신 시 레이아웃이 흔들리지 않는다.
- 경매방을 빠져나가면 구독이 해제된다.
- 재연결 후 최신 현재가와 남은 시간이 맞다.
- 색상 없이도 상태를 이해할 수 있다.
- 키보드만으로 입찰과 채팅 전송이 가능하다.

## CI 확인

- `next build`를 실행해야 한다.
- typecheck를 실행해야 한다.
- ESLint CLI 또는 Biome으로 lint를 실행해야 한다.
- unit/component test를 실행해야 한다.
- 주요 E2E smoke test를 실행해야 한다.
- 실패한 테스트를 문서화 없이 제외하면 안 된다.
- Next.js 16부터 `next lint`는 제거됐으므로 사용하지 않는다.

예상 스크립트:

```json
{
  "scripts": {
    "build": "next build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

## 금지한다

- WebSocket과 시간 계산을 수동 클릭으로만 확인하는 것을 금지한다.
- 입찰 성공 happy path만 테스트하는 것을 금지한다.
- 모바일 viewport를 테스트하지 않는 것을 금지한다.
- 테스트 안정성을 이유로 실제 요구사항을 약화하는 것을 금지한다.

## 확인해야 한다

- reducer가 중복 이벤트와 오래된 이벤트를 무시하는지 확인해야 한다.
- `409 Conflict`, `401`, `429`, `500` UI 매핑을 확인해야 한다.
- `prefers-reduced-motion` 환경에서도 핵심 상태 이해가 가능한지 확인해야 한다.
- Playwright screenshot 또는 trace가 실패 분석에 남는지 확인해야 한다.

## 근거 문서

- [Testing: Vitest](https://nextjs.org/docs/app/guides/testing/vitest)
- [Testing: Playwright](https://nextjs.org/docs/app/guides/testing/playwright)
- [ESLint](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)
- `docs/frontend-ui-ux-guide.md`
