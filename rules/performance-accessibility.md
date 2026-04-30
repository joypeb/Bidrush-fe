# Performance와 Accessibility 규칙

## 기본 원칙

- 성능 최적화는 사용자가 경매 상태를 빨리 믿고 행동하게 만드는 방향이어야 한다.
- 접근성은 나중에 고치는 항목이 아니라 컴포넌트 기본 요구사항이다.
- 이미지, 폰트, CSS, metadata는 Next.js 공식 최적화 기능을 우선 사용한다.
- 실시간 상태 변화는 시각적 표시와 보조 기술 알림을 균형 있게 제공해야 한다.

## 이미지

- 상품 이미지는 `next/image`를 우선 사용한다.
- 이미지에는 의미 있는 `alt`를 제공한다. 장식 이미지는 `alt=""`를 사용한다.
- 원격 이미지는 `next.config.js`의 `images.remotePatterns`에 허용 origin을 명시해야 한다.
- remote image에는 `width`와 `height` 또는 `fill`과 `sizes`를 제공해야 한다.
- 이미지 컨테이너는 고정 aspect ratio를 가져야 한다.
- 첫 화면 핵심 이미지만 preload를 검토한다.
- 인증이 필요한 이미지 URL은 기본 Image Optimization API가 헤더를 전달하지 않는 점을 고려해야 한다.

근거: Next.js Image 문서는 `width`와 `height`가 브라우저가 aspect ratio를 예약해 layout shift를 줄이는 데 쓰인다고 설명한다.

## 폰트

- 웹폰트는 `next/font`를 우선 사용한다.
- 외부 런타임 폰트 요청을 직접 추가하지 않는다.
- 숫자 UI는 tabular number를 사용한다.
- 폰트 변경으로 가격, 타이머, 버튼 폭이 흔들리지 않게 확인한다.

근거: Next.js Font Optimization 문서는 `next/font`가 폰트를 자동 최적화하고 외부 네트워크 요청을 제거해 privacy와 performance를 개선한다고 설명한다.

## Metadata

- `app/layout.tsx` 또는 route별 `page.tsx`에서 `metadata` 또는 `generateMetadata`를 사용한다.
- 경매 상세 페이지는 상품명과 대표 이미지를 metadata에 반영한다.
- Open Graph 이미지는 기본 이미지와 경매별 이미지 전략을 구분한다.
- favicon과 app icon은 App Router metadata file convention을 따른다.

## Loading과 Streaming

- route segment마다 의미 있는 `loading.tsx`를 둔다.
- skeleton은 실제 UI 구조와 크기를 최대한 맞춘다.
- spinner만 있는 로딩 화면은 피한다.
- 공유 layout은 새 route segment 로딩 중에도 상호작용 가능해야 한다.

## 접근성

- 모든 버튼은 키보드로 접근 가능해야 한다.
- focus outline을 제거하지 않는다.
- icon-only button은 `aria-label`을 가진다.
- 상태 변경은 텍스트와 아이콘을 함께 사용한다.
- 현재가, 입찰 결과, 연결 복구 같은 핵심 변화는 필요한 경우 `aria-live="polite"`를 사용한다.
- 카운트다운은 매초 screen reader를 방해하지 않게 핵심 상태 변화만 알린다.
- toast만으로 성공과 실패를 전달하지 않는다.
- 폼 오류는 필드와 연결된 `aria-describedby`를 사용한다.
- 색상 대비는 WCAG AA 이상을 목표로 한다.

Good:

```tsx
<button aria-label="뒤로가기" type="button">
  <ArrowLeft aria-hidden="true" />
</button>
```

```tsx
<p aria-live="polite">입찰이 확정되었습니다. 현재가 42,000원</p>
```

Bad:

```tsx
<button>
  <ArrowLeft />
</button>
```

## 모션

- 가격 갱신 flash는 300-600ms로 제한한다.
- 종료 임박 UI는 계속 흔들리면 안 된다.
- `prefers-reduced-motion`을 존중한다.
- 모션은 상태 이해를 돕는 목적이어야 한다.

## 금지한다

- `<img>`를 무분별하게 사용해 layout shift를 만드는 것을 금지한다.
- 외부 폰트 CSS를 head에 직접 붙이는 것을 금지한다.
- 버튼의 focus style을 제거하는 것을 금지한다.
- 색상만으로 종료 임박, 성공, 실패를 전달하는 것을 금지한다.
- screen reader에 매초 카운트다운을 읽히는 것을 금지한다.

## 확인해야 한다

- Lighthouse 또는 동등한 도구로 LCP, CLS, 접근성 기본 점검을 수행해야 한다.
- 모바일 360px와 데스크톱 1280px 이상에서 텍스트 겹침이 없는지 확인해야 한다.
- 이미지 로딩 전후 카드 높이가 바뀌지 않는지 확인해야 한다.
- 키보드만으로 목록, 경매방, 입찰, 채팅, 판매 등록을 사용할 수 있는지 확인해야 한다.

## 근거 문서

- [Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [Next.js Accessibility](https://nextjs.org/docs/architecture/accessibility)
- `docs/frontend-ui-ux-guide.md`
