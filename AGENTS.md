# lattae-app

Vue 3 + TypeScript + Vite 프론트엔드다. 패키지 매니저는 npm이다.

## 도구가 읽는 위치

스킬의 정본은 `.agents/skills/`다. Cursor와 Codex는 이 디렉터리를 자동으로 불러온다. Claude Code는 이 파일과 `.claude/commands/`의 슬래시 명령을 따른다.

`.claude/skills/`에는 같은 스킬을 다시 두지 않는다. Cursor가 `.agents/skills/`와 `.claude/skills/`를 둘 다 읽어서 같은 스킬이 두 번 등록된다.

작업을 시작하기 전에 아래 표에서 맞는 `SKILL.md`를 읽고 그 절차를 따른다. 절차 안의 검증(테스트, `npm run build`, 화면 확인)을 건너뛰지 않는다.

리뷰 페르소나는 `.claude/agents/`에 있다. `/review`와 `/ship`은 그 파일을 사용한다.

## 슬래시 명령

| 명령 | 스킬 |
| --- | --- |
| `/spec` | `spec-driven-development` |
| `/plan` | `planning-and-task-breakdown` |
| `/build` | `incremental-implementation`, `test-driven-development` |
| `/test` | `test-driven-development` |
| `/review` | `code-review-and-quality` |
| `/code-simplify` | `code-simplification` |
| `/ship` | `shipping-and-launch` |

## 언제 어떤 스킬을 쓰는지

| 상황 | 스킬 |
| --- | --- |
| 코드를 쓰기 전에 목표와 완료 조건을 정할 때 | `spec-driven-development` |
| 스펙을 작은 태스크로 나눌 때 | `planning-and-task-breakdown` |
| 한 슬라이스만 구현하고 검증할 때 | `incremental-implementation` |
| 기능이나 버그 수정을 테스트로 증명할 때 | `test-driven-development` |
| 화면, 컴포넌트, 레이아웃, 접근성을 만들 때 | `frontend-ui-engineering`, `frontend-design` |
| UI를 가이드라인으로 리뷰할 때 | `web-design-guidelines` |
| 브라우저에서 동작을 확인할 때 | `browser-testing-with-devtools` |
| 머지 전에 변경을 리뷰할 때 | `code-review-and-quality` |
| 동작은 유지하고 코드를 단순하게 만들 때 | `code-simplification` |
| 입력, 시크릿, 의존성, XSS를 다룰 때 | `security-and-hardening` |
| 로딩, 번들, 렌더 비용을 다룰 때 | `performance-optimization` |
| 빌드가 깨졌거나 원인을 좁힐 때 | `debugging-and-error-recovery` |
| 인증, 삭제, 배포처럼 되돌리기 어려운 변경일 때 | `doubt-driven-development` |
| 커밋과 브랜치 단위를 정할 때 | `git-workflow-and-versioning` |
| API나 구조 결정을 문서로 남길 때 | `documentation-and-adrs` |
| 출시 여부를 판단할 때 | `shipping-and-launch` |

## 이 저장소의 제약

- UI는 `src/`의 Vue 3 SFC, `<script setup lang="ts">`로 작성한다.
- 라우터, Pinia, 테스트 러너는 아직 없다. 테스트를 추가할 때는 Vitest를 쓴다.
- 완료 확인은 `npm run build`다. 타입체크와 프로덕션 빌드가 통과해야 한다.
- `.agents/references/testing-patterns.md`의 예시는 JavaScript와 React다. 원칙만 가져오고 Vue SFC에 맞게 작성한다.

## 일부러 넣지 않은 것

React, Next.js, shadcn, Python, PostgreSQL, LLM, MCP 스킬은 이 저장소의 스택이 아니다. `ui-ux-pro-max`는 Vue를 지원하지만 검색용 데이터 묶음이 크고, 화면 작업은 `frontend-ui-engineering`, `frontend-design`, `web-design-guidelines`로 커버된다. 세션 훅과 업스트림 저장소 전체도 포함하지 않았다.
