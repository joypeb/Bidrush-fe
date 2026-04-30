# UI와 Design System 규칙

## 기본 원칙

- BidRush UI는 실시간 경매 상태를 가장 먼저 읽히게 해야 한다.
- 장식보다 현재가, 남은 시간, 입찰 버튼, 내 상태, 연결 상태를 우선한다.
- 디자인 토큰은 `src/styles/tokens.css` 또는 Tailwind theme에 정의하고 컴포넌트에서 원시 색상값을 반복하지 않는다.
- 카드 radius는 8px 이하를 기본으로 한다.
- 중첩 카드는 피한다.
- 색상만으로 상태를 전달하지 않는다.

## 색상

필수 의미 토큰:

```css
:root {
  --color-bg: #f7f8fa;
  --color-surface: #ffffff;
  --color-surface-muted: #f1f3f5;
  --color-border: #d9dee5;
  --color-text: #111827;
  --color-text-muted: #5b6472;
  --color-brand: #176b5b;
  --color-bid: #f59e0b;
  --color-danger: #dc2626;
  --color-info: #2563eb;
  --color-success: #15803d;
}
```

사용 기준:

- 브랜드 CTA: `--color-brand`
- 현재가 갱신과 입찰 이벤트: `--color-bid`
- 종료 임박 10초 이하와 실패: `--color-danger`
- 연결 복구와 새 메시지: `--color-info`
- 최고 입찰, 낙찰: `--color-success`

## 타이포그래피

- 기본 폰트는 `Pretendard`, `Noto Sans KR`, system sans-serif 순으로 사용한다.
- 폰트 로딩은 `next/font`를 우선한다.
- 가격과 카운트다운은 `font-variant-numeric: tabular-nums`를 사용한다.
- 모바일 버튼 텍스트는 14px 미만으로 내리지 않는다.
- 긴 상품명은 2줄까지 표시하고 말줄임 처리한다.

## CSS 방식

- 전역 CSS는 reset, tokens, Tailwind base처럼 전역인 것만 포함한다.
- 대부분의 컴포넌트 스타일은 Tailwind CSS를 사용할 수 있다.
- Tailwind로 표현이 복잡하거나 컴포넌트 고유 스타일이면 CSS Modules를 사용한다.
- import 정렬 도구가 CSS import 순서를 망가뜨리지 않게 확인한다.
- CSS-in-JS는 명확한 필요가 없으면 추가하지 않는다.

근거: Next.js 공식 CSS 문서는 global CSS는 진짜 전역 스타일에, Tailwind는 컴포넌트 스타일링에, CSS Modules는 scoped CSS에 쓰는 방식을 권장한다.

## 주요 컴포넌트

### AuctionCard

- 이미지, 제목, 현재가, 남은 시간, 입찰 수, 상태를 반드시 표시한다.
- 이미지 비율은 고정한다.
- 현재가는 제목보다 더 강하게 보여야 한다.
- 종료 임박은 배지, 문구, 색상으로 함께 표시한다.

### CountdownTimer

- 서버 종료 시간을 기준으로 표시한다.
- 60초 이하부터 초 단위 강조를 시작한다.
- 10초 이하에서는 위험 상태를 표시한다.
- 자동 연장 이벤트 수신 시 즉시 `+20초 연장`을 보여준다.

### BidPanel

- 모바일에서는 하단 고정 패널로 둔다.
- 빠른 금액 버튼과 직접 입력을 제공한다.
- `submitting` 중 중복 제출을 막는다.
- 서버 확정 전에는 성공 UI를 보여주지 않는다.

### ChatPanel

- 일반 메시지, 시스템 메시지, 입찰 이벤트 메시지를 구분한다.
- 새 메시지가 와도 사용자가 과거 메시지를 보는 중이면 자동 스크롤하지 않는다.
- 모바일에서 입찰 패널과 겹치지 않아야 한다.

### ConnectionStatus

- 연결됨, 연결 중, 다시 연결 중, 연결 끊김을 구분한다.
- 연결 끊김 상태는 숨기지 않는다.
- 연결 끊김 상태에서는 입찰과 채팅 전송을 막는다.

## 화면 규칙

- 첫 화면은 경매 목록이어야 한다. 마케팅 랜딩 페이지를 먼저 만들지 않는다.
- 경매방의 가장 큰 시각 요소는 현재가와 남은 시간이다.
- 판매 등록은 사진, 제목, 설명, 시작가, 종료 시간, 카테고리 순서로 작성한다.
- 인증 화면은 사용자가 하던 행동으로 돌아갈 수 있게 redirect 정보를 보존한다.

## 금지한다

- 카지노, 게임 머니, 과도한 승부 자극처럼 보이는 표현을 금지한다.
- 가격 숫자가 크게 튀거나 화면을 흔드는 애니메이션을 금지한다.
- 버튼 안 텍스트가 모바일에서 잘리는 상태를 금지한다.
- 색상만으로 입찰 성공, 실패, 종료 임박을 표현하는 것을 금지한다.
- 사용자가 누를 수 없는 제외 기능을 disabled 버튼으로 노출하는 것을 금지한다.

## 확인해야 한다

- 360px 모바일 너비에서 텍스트가 넘치지 않는지 확인해야 한다.
- 가격 갱신 시 레이아웃이 흔들리지 않는지 확인해야 한다.
- 채팅 입력창과 입찰 패널이 겹치지 않는지 확인해야 한다.
- `prefers-reduced-motion` 환경에서 불필요한 모션이 줄어드는지 확인해야 한다.

## 근거 문서

- [Next.js CSS](https://nextjs.org/docs/app/getting-started/css)
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- `docs/frontend-ui-ux-guide.md`
