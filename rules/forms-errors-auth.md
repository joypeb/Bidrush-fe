# Forms, Errors, Auth 규칙

## 기본 원칙

- 모든 폼은 클라이언트 검증과 서버 검증 실패 표시를 모두 가져야 한다.
- expected error는 사용자가 이해하고 다음 행동을 할 수 있는 상태로 표현해야 한다.
- 인증과 인가는 UI 표시만으로 끝내면 안 된다.
- 서버 비밀값은 브라우저 번들로 노출하지 않는다.
- 백엔드 오류 응답은 Problem Details 형식을 기준으로 매핑한다.

## 폼

- 판매 등록 폼은 사진, 상품명, 설명, 시작가, 종료 시간, 카테고리를 검증해야 한다.
- label을 placeholder로 대체하지 않는다.
- 필드 오류는 해당 필드 바로 아래에 표시한다.
- 가격 입력은 `inputMode="numeric"`을 사용한다.
- 종료 시간은 사용자 로컬 시간으로 보여주고 API 전송 시 ISO-8601 UTC 문자열로 변환한다.
- 제출 중에는 중복 제출을 막는다.
- 성공 후에는 생성된 경매방으로 이동한다.

Server Actions 사용 기준:

- Next.js 자체 BFF 또는 서버에서 직접 처리하는 폼 mutation에는 Server Actions를 사용할 수 있다.
- Spring 백엔드 API가 권위자인 mutation은 API client 또는 Route Handler를 통해 백엔드 계약을 따른다.
- Server Action을 사용하더라도 인증과 인가는 반드시 action 내부에서 검증해야 한다.

근거: Next.js 공식 Forms 문서는 Server Actions가 서버에서 실행되며, 인증과 인가를 각 Server Action 내부에서 검증해야 한다고 설명한다.

## 오류 처리

- 정상 업무 흐름에서 발생 가능한 오류는 expected error로 처리한다.
- expected error는 throw 대신 반환값 또는 공통 result 타입으로 표현한다.
- route segment의 예상하지 못한 런타임 오류는 `error.tsx`에서 fallback UI와 재시도를 제공한다.
- 404는 `not-found.tsx` 또는 명시적인 빈 상태로 분리한다.
- 운영 환경에서 내부 오류 메시지, stack trace, token, SQL, 개인정보를 노출하지 않는다.

Problem Details 매핑:

| HTTP | UI |
|:---|:---|
| 400 | 필드 오류 또는 상단 오류 |
| 401 | 로그인 유도 |
| 403 | 접근 불가 안내 |
| 404 | 경매 없음, 목록 이동 |
| 409 | 최신 현재가 반영, 재입찰 유도 |
| 429 | 재시도 가능 시간 표시 |
| 500 | 짧은 안내와 재시도 |

문구:

- `현재가보다 높은 금액을 입력해주세요.`
- `방금 더 높은 입찰이 들어왔습니다. 현재가를 확인해주세요.`
- `경매가 종료되어 입찰할 수 없습니다.`
- `연결이 불안정합니다. 잠시 후 다시 시도해주세요.`

피해야 할 문구:

- `오류가 발생했습니다.`
- `잘못된 요청입니다.`
- `처리에 실패했습니다.`
- `알 수 없는 문제입니다.`

## 인증

- 목록 탐색은 비로그인으로 허용할 수 있다.
- 입찰, 채팅 전송, 판매 등록 제출은 로그인이 필요하다.
- 로그인 후 원래 화면으로 돌아갈 수 있게 redirect URL을 보존한다.
- 인증 상태에 따라 UI를 숨겨도 백엔드 권한 검증을 대체할 수 없다.
- auth check는 layout에만 의존하지 않는다. Next.js partial rendering 때문에 layout이 모든 navigation마다 다시 검증된다고 가정하면 안 된다.
- 민감한 데이터 요청은 데이터 접근 지점 가까이에서 권한을 확인해야 한다.

## 환경 변수

- 브라우저에서 읽어야 하는 공개 값만 `NEXT_PUBLIC_` prefix를 붙인다.
- 비밀키, 토큰 signing secret, S3 secret, 내부 API key는 `NEXT_PUBLIC_`로 만들지 않는다.
- `NEXT_PUBLIC_` 값은 build 시점에 브라우저 번들에 인라인된다는 점을 고려해야 한다.
- 런타임에 바뀌어야 하는 비밀값은 서버에서만 읽는다.

예상 공개 env:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8080/ws
```

## 금지한다

- 비밀번호, access token, refresh token을 `localStorage`에 저장하는 것을 금지한다.
- 서버 비밀값에 `NEXT_PUBLIC_`를 붙이는 것을 금지한다.
- 오류 응답의 `detail`을 검증 없이 그대로 toast로 노출하는 것을 금지한다.
- 인증이 필요한 API를 UI 버튼 숨김만으로 보호하는 것을 금지한다.
- 폼 제출 실패 시 사용자가 입력한 값을 모두 지우는 것을 금지한다.

## 확인해야 한다

- 로그인 만료 상태에서 입찰, 채팅, 판매 등록이 안전하게 실패하는지 확인해야 한다.
- `409 Conflict`가 현재가 갱신과 재입찰 UX로 연결되는지 확인해야 한다.
- `401` 이후 로그인 완료 시 원래 경매방으로 돌아오는지 확인해야 한다.
- 환경 변수 중 브라우저에 노출되는 값이 모두 공개 가능한 값인지 확인해야 한다.

## 근거 문서

- [Forms](https://nextjs.org/docs/app/guides/forms)
- [Mutating Data](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)
- [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Authentication](https://nextjs.org/docs/app/guides/authentication)
- `rules/error-handling.md`
- `rules/security.md`
