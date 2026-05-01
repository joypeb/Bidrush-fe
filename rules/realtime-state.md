# Realtime과 State 규칙

## 기본 원칙

- 실시간 입찰은 BidRush의 핵심 경험이므로 연결 상태, pending 상태, 서버 확정 상태를 항상 구분해야 한다.
- WebSocket은 Client Component와 전용 realtime 모듈에서만 다룬다.
- 서버 이벤트는 중복, 지연, 순서 뒤바뀜이 가능하다고 가정한다.
- 모든 경매 상태 전이는 reducer 또는 명시적 state machine으로 처리해야 한다.
- 경매 종료, 자동 연장, 입찰 거절은 채팅 시스템 메시지와 주요 상태 영역에 함께 반영해야 한다.

## WebSocket 연결

- STOMP client 생성, 구독, 재연결, 해제는 `src/lib/realtime.ts` 또는 `features/auctions/realtime.ts`에 모은다.
- 컴포넌트에서 STOMP client 세부 API를 직접 호출하지 않는다.
- 경매방 진입 시 해당 경매 topic만 구독한다.
- 경매방 unmount 시 반드시 unsubscribe한다.
- 로그인 토큰이 필요한 연결은 토큰 만료와 재인증 흐름을 처리해야 한다.
- 연결이 끊기면 입찰과 채팅 전송을 일시적으로 막아야 한다.

## 이벤트 모델

예상 이벤트는 아래처럼 처리한다.

| 이벤트 | UI 반영 |
|:---|:---|
| `auction.snapshot` | 전체 상태 동기화 |
| `auction.bid.accepted` | 현재가, 최고 입찰자, 입찰 수 갱신 |
| `auction.bid.rejected` | pending 해제, 거절 사유 표시 |
| `auction.outbid` | 내 최고 입찰 상태 해제 |
| `auction.extended` | 종료 시간, 연장 횟수, 시스템 메시지 갱신 |
| `auction.closed` | 입찰 비활성화, 결과 확인 상태 표시 |
| `chat.message.created` | 채팅 메시지 추가 |
| `chat.system.created` | 시스템 메시지 추가 |

각 이벤트는 가능하면 아래 필드를 가져야 한다.

- `eventId`
- `auctionId`
- `occurredAt`
- `version`
- `payload`

`eventId` 또는 `version`이 없으면 중복 방지와 정렬 정책을 프론트엔드에서 보완해야 한다.

## 입찰 상태

입찰 UI는 아래 상태를 구분해야 한다.

| 상태 | 의미 | UI |
|:---|:---|:---|
| `idle` | 입력 가능 | 기본 입찰 버튼 |
| `editing` | 사용자가 금액 입력 중 | 금액 검증 |
| `submitting` | 서버 확인 중 | 버튼 disabled, `입찰 확인 중` |
| `accepted` | 서버 확정 | 현재가 갱신, 성공 상태 |
| `rejected` | 서버 거절 | 사유 표시, 최신 현재가 반영 |
| `outbid` | 다른 사용자가 더 높게 입찰 | 정보 상태 |
| `closed` | 경매 종료 | 입찰 비활성화 |
| `loginRequired` | 인증 필요 | 로그인 유도 |
| `offline` | 실시간 연결 끊김 | 입찰 비활성화 |

## Reducer 규칙

- 이벤트 적용은 순수 함수로 작성해야 한다.
- reducer는 현재 state와 이벤트를 받아 다음 state를 반환해야 한다.
- 이벤트 순서가 오래된 경우 무시하거나 snapshot 재동기화를 요청해야 한다.
- 입찰 pending 상태와 서버 확정 상태를 같은 필드로 덮어쓰지 않는다.
- 채팅 메시지와 경매 상태는 같은 이벤트 stream을 쓰더라도 별도 slice로 관리한다.

Good:

```ts
type AuctionEvent =
  | { type: "auction.bid.accepted"; eventId: string; version: number; payload: BidAcceptedPayload }
  | { type: "auction.extended"; eventId: string; version: number; payload: AuctionExtendedPayload };

export function auctionRoomReducer(state: AuctionRoomState, event: AuctionEvent): AuctionRoomState {
  if (event.version <= state.version) return state;

  switch (event.type) {
    case "auction.bid.accepted":
      return {
        ...state,
        version: event.version,
        currentPrice: event.payload.currentPrice,
        bidCount: event.payload.bidCount,
        pendingBidId: undefined,
      };
    case "auction.extended":
      return {
        ...state,
        version: event.version,
        endsAt: event.payload.endsAt,
        extensionCount: event.payload.extensionCount,
      };
  }
}
```

## 자동 연장

- 종료 30초 전 입찰로 20초 연장되는 정책을 UI에 명확히 표시해야 한다.
- 연장 횟수는 `연장 1/3` 형식으로 표시한다.
- 연장 발생 시 `+20초 연장` toast와 시스템 메시지를 같이 보여준다.
- 최대 연장 도달 시 `마지막 연장` 상태를 표시한다.

## 채팅

- 사용자가 과거 메시지를 보고 있으면 새 메시지 도착 시 자동 스크롤하지 않는다.
- 대신 `새 메시지` 버튼을 표시한다.
- 시스템 메시지와 일반 메시지는 시각적으로 구분한다.
- 전송 실패 메시지는 재시도 행동을 가져야 한다.

## 금지한다

- WebSocket 이벤트를 여러 컴포넌트에서 각각 구독하는 것을 금지한다.
- 같은 이벤트를 현재가, 입찰 로그, 채팅에서 각각 따로 처리해 상태가 어긋나게 만드는 것을 금지한다.
- 연결 끊김 상태에서 입찰 버튼을 활성화하는 것을 금지한다.
- 브라우저 시계만 믿고 경매 종료를 확정하는 것을 금지한다.
- `Date.now()` 기반 타이머만으로 서버 종료 시간을 대체하는 것을 금지한다.

## 확인해야 한다

- 재연결 성공 후 snapshot 재조회가 실행되는지 확인해야 한다.
- 중복 이벤트가 가격과 입찰 수를 두 번 올리지 않는지 확인해야 한다.
- 경매방을 빠져나가면 구독과 타이머가 정리되는지 확인해야 한다.
- 종료 직후 `낙찰 결과 확인 중` 상태를 보여주는지 확인해야 한다.

## 근거 문서

- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)
- `docs/design.md`
- `docs/frontend-ui-ux-guide.md`
