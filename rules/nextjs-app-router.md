# Next.js App Router 규칙

## 기본 원칙

- 프론트엔드는 Next.js App Router를 기본 라우팅 시스템으로 사용해야 한다.
- `pages/` Router와 `app/` Router를 새 코드에서 함께 사용하지 않는다.
- `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts` 파일 규칙을 따라야 한다.
- `frontend/` 안에서 먼저 개발하되, 별도 저장소로 분리해도 같은 구조를 유지해야 한다.
- 화면 구조는 `docs/frontend-ui-ux-guide.md`의 정보 구조를 따른다.

근거: Next.js 공식 문서는 App Router가 파일 시스템 기반 라우터이며 React Server Components, Suspense, Server Functions를 사용한다고 설명한다.

## 권장 구조

```text
frontend/
  app/
    layout.tsx
    page.tsx
    auctions/
      page.tsx
      [auctionId]/
        page.tsx
        loading.tsx
        error.tsx
    sell/
      new/
        page.tsx
    auth/
      login/
        page.tsx
      signup/
        page.tsx
    me/
      page.tsx
  src/
    components/
    features/
    lib/
    styles/
```

## Server Component와 Client Component

- `layout.tsx`와 `page.tsx`는 기본적으로 Server Component로 작성해야 한다.
- 브라우저 상태, 이벤트 핸들러, `useEffect`, WebSocket, `window`, `localStorage`가 필요한 컴포넌트만 Client Component로 만든다.
- `use client`는 leaf component에 가깝게 둔다.
- 큰 화면 전체에 `use client`를 붙이는 것을 금지한다.
- Server Component에서 가져온 데이터는 직렬화 가능한 props로 Client Component에 전달해야 한다.
- React Context provider는 Client Component로 만들고 필요한 범위에만 감싼다.

Good:

```tsx
// app/auctions/[auctionId]/page.tsx
import { getAuctionSnapshot } from "@/features/auctions/api";
import { AuctionRoom } from "@/features/auctions/AuctionRoom";

export default async function Page({ params }: { params: Promise<{ auctionId: string }> }) {
  const { auctionId } = await params;
  const snapshot = await getAuctionSnapshot(auctionId);
  return <AuctionRoom initialSnapshot={snapshot} />;
}
```

```tsx
// features/auctions/AuctionRoom.tsx
"use client";

export function AuctionRoom({ initialSnapshot }: Props) {
  // WebSocket, input state, optimistic pending state
}
```

Bad:

```tsx
"use client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}
```

## 라우팅

- `/`는 진행 중인 경매 목록을 보여줘야 한다.
- `/auctions/[auctionId]`는 실시간 경매방이어야 한다.
- `/sell/new`는 판매 등록이어야 한다.
- 로그인 후 복귀가 필요한 화면은 redirect URL을 보존해야 한다.
- 필터, 검색, 정렬은 URL query에 반영해야 한다.
- 내부 이동은 `next/link`를 우선 사용한다.
- 명령형 이동은 사용자 행동 이후에만 `useRouter`를 사용한다.

## Loading UI와 Error UI

- 데이터가 필요한 route segment에는 의미 있는 `loading.tsx`를 둬야 한다.
- `loading.tsx`는 실제 화면 구조와 비슷한 skeleton을 보여줘야 한다.
- 예상하지 못한 런타임 오류를 복구할 수 있는 segment에는 `error.tsx`를 둬야 한다.
- `error.tsx`는 Client Component여야 하며 재시도 행동을 제공해야 한다.
- `not-found.tsx`는 없는 경매, 삭제된 경매, 접근 불가와 구분해서 사용해야 한다.

## 금지한다

- 새 코드에서 Pages Router API인 `getServerSideProps`, `getStaticProps`, `getInitialProps`를 사용하는 것을 금지한다.
- `app` route segment에 `page.tsx`와 `route.ts`를 같은 레벨에 동시에 두는 것을 금지한다.
- 상호작용이 없는 목록, 상세 제목, 정적 레이아웃을 Client Component로 만드는 것을 금지한다.
- URL 상태와 React 상태를 중복으로 두고 서로 어긋나게 만드는 것을 금지한다.

## 확인해야 한다

- route segment별 `loading.tsx`, `error.tsx`, `not-found.tsx` 필요 여부를 확인해야 한다.
- 경매방 unmount 시 WebSocket 구독이 해제되는지 확인해야 한다.
- 모바일 경매방에서 하단 입찰 패널이 네비게이션과 겹치지 않는지 확인해야 한다.

## 근거 문서

- [Next.js App Router](https://nextjs.org/docs/app)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [error.js](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
