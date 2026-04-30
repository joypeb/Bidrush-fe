# Rendering과 Data 규칙

## 기본 원칙

- 서버에서 가져올 수 있는 초기 데이터는 Server Component에서 가져와야 한다.
- 실시간으로 바뀌는 경매 상태는 snapshot과 WebSocket delta를 분리해야 한다.
- 백엔드 API 계약은 OpenAPI를 기준으로 타입을 생성하거나 명시적 schema로 검증해야 한다.
- API 응답은 프론트엔드 내부 모델로 한 번 변환한 뒤 UI에 전달해야 한다.
- 경매 상태는 서버가 단일 진실 공급원이다.

근거: Next.js 공식 문서는 `fetch` 요청이 기본적으로 캐시되지 않으며, 캐시가 필요한 경우 명시적으로 캐시 지시어나 Suspense 스트리밍을 사용하라고 설명한다.

## 데이터 패칭

- 경매 목록 첫 렌더는 Server Component에서 가져온다.
- 경매방은 REST snapshot을 먼저 가져오고 WebSocket을 연결한다.
- 검색, 카테고리, 상태 필터는 URL query에서 읽어 API 요청에 반영한다.
- 사용자 입력에 따라 자주 변하는 데이터는 Client Component에서 TanStack Query 또는 SWR로 가져올 수 있다.
- 동일한 서버 데이터 요청이 여러 곳에서 필요하면 공통 fetcher 또는 React cache를 검토한다.
- 요청이 느린 segment는 Suspense와 `loading.tsx`를 사용해 화면 응답성을 유지한다.

Good:

```tsx
export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const auctions = await getAuctions(params);
  return <AuctionList auctions={auctions} />;
}
```

Bad:

```tsx
"use client";

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  useEffect(() => {
    fetch("/api/auctions").then((res) => res.json()).then(setAuctions);
  }, []);
}
```

## 캐싱

- 실시간 경매 snapshot, 현재가, 남은 시간, 최고 입찰자는 기본적으로 캐시하지 않는다.
- 카테고리, 공개 정적 설정, UI copy처럼 자주 바뀌지 않는 데이터만 명시적으로 캐시한다.
- 캐시를 사용할 때는 invalidation 조건을 문서화해야 한다.
- 입찰 성공, 판매 등록 성공, 로그인 상태 변경 후 관련 query를 무효화해야 한다.
- Route Handler의 `GET`도 기본적으로 캐시되지 않는다는 전제로 작성한다. 캐시가 필요할 때만 명시적으로 opt-in한다.

## Route Handler

- `app/api/**/route.ts`는 브라우저에서 직접 호출하면 안 되는 서버 측 중계, 쿠키 처리, 외부 서비스 보호가 필요할 때만 사용한다.
- 단순 백엔드 REST 호출을 무조건 Next.js Route Handler로 감싸지 않는다.
- Route Handler는 Web Request/Response API를 사용하고 HTTP method 의미를 지켜야 한다.
- 인증 토큰, 쿠키, 서버 비밀값을 다루는 Route Handler는 입력 검증과 오류 매핑을 가져야 한다.
- 같은 route segment에 `page.tsx`와 `route.ts`를 같이 둘 수 없으므로 구조를 분리해야 한다.

## API 클라이언트

- API base URL은 `NEXT_PUBLIC_API_BASE_URL` 또는 서버 전용 env로 분리한다.
- DTO 타입은 OpenAPI 생성 타입을 우선한다.
- OpenAPI 생성이 아직 없으면 Zod schema를 `features/*/schemas.ts`에 둔다.
- 날짜는 API 경계에서 ISO-8601 string으로 받고 화면 직전 `Date` 또는 formatter로 변환한다.
- 금액은 number 손실 가능성을 확인한다. 백엔드가 string decimal을 주면 string으로 받고 formatter에서 처리한다.
- Problem Details 응답은 공통 오류 타입으로 파싱한다.

## BidRush 데이터 흐름

경매방은 아래 순서를 따라야 한다.

1. Server Component에서 snapshot 조회
2. Client Component에 snapshot 전달
3. WebSocket 연결
4. `auction.snapshot` 또는 version 확인
5. `auction.bid.accepted`, `auction.extended`, `auction.closed` 등 delta 반영
6. 재연결 시 snapshot 재조회

## 금지한다

- 현재가와 남은 시간을 클라이언트 로컬 상태만으로 확정하는 것을 금지한다.
- 입찰 성공을 서버 응답 전에 확정 UI로 보여주는 것을 금지한다.
- API 응답 객체를 여러 컴포넌트에서 임의로 가공하는 것을 금지한다.
- 서버 전용 token, secret, presigned URL 생성 로직을 Client Component에 넣는 것을 금지한다.
- `cache: "force-cache"`를 실시간 경매 상태 요청에 사용하는 것을 금지한다.

## 확인해야 한다

- 경매 목록과 경매방 데이터가 같은 가격 포맷과 상태 enum을 쓰는지 확인해야 한다.
- `409 Conflict` 또는 입찰 거절 응답이 최신 현재가로 UI를 갱신하는지 확인해야 한다.
- 재연결 후 누락 이벤트를 snapshot으로 복구하는지 확인해야 한다.
- 필터 변경 시 URL, 서버 요청, 화면 상태가 일치하는지 확인해야 한다.

## 근거 문서

- [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Caching](https://nextjs.org/docs/app/guides/caching-without-cache-components)
- [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
