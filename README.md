# Menu_pick

## 📁 프로젝트 구조

```
Menu_pick/
 ├─ backend/    # Spring Boot
 └─ frontend/   # React + TypeScript
```

---

## 🤝 협업 규칙

### 작업 흐름

```
Issue 생성
  → develop에서 작업 브랜치 생성
  → 기능 구현 및 자체 테스트
  → 작업 브랜치 → develop PR
  → CodeRabbit 자동 리뷰 → 수정 반영
  → 팀원 확인 후 develop에 Merge
  → (기능 개발 완료 후) develop에서 통합 테스트
  → develop → main PR → 배포
```

> 💡 **평소에는 `main` 브랜치를 사용하지 않습니다.**
> 모든 작업은 `develop`에서 브랜치를 만들고, `develop`으로 PR을 보냅니다.
> `main`은 배포할 때만 `develop`을 Merge합니다.

---

## 📌 Issue

- 작업 시작 전 **반드시 Issue 생성**
- Issue 하나에 작업 하나
- Label, 담당자(Assignee) 지정
- PR 본문에 `Closes #이슈번호`를 적어 Merge 시 Issue가 자동으로 닫히게 합니다.

### 제목 규칙

| 타입 | 용도 | 예시 |
| --- | --- | --- |
| `feat` | 새 기능 | `feat: 방 생성 API 구현` |
| `fix` | 버그 수정 | `fix: 투표 집계 오류 수정` |
| `refactor` | 코드 개선 (기능 변화 없음) | `refactor: Button 컴포넌트 개선` |
| `docs` | 문서 | `docs: README 수정` |
| `chore` | 설정, 빌드, 패키지 | `chore: 프로젝트 초기 세팅` |

### 내용 템플릿

```markdown
## ✅ TODO
- [ ]
- [ ]

## 💬 참고 사항 (선택)
-
```

---

## 🌿 Branch

### 브랜치 역할

| 브랜치 | 역할 |
| --- | --- |
| `main` | 배포용 안정 브랜치 (평소 사용 X) |
| `develop` | 기능 통합 및 테스트 (기본 브랜치) |
| `feat/*`, `fix/*` 등 | Issue 단위 작업 브랜치 |

### 네이밍

```
타입/이슈번호-작업내용

feat/2-create-room
fix/3-vote-error
refactor/7-button
docs/13-readme
chore/34-eslint
```

### 브랜치 생성

항상 **최신 `develop`** 에서 생성합니다. (`main`에서 생성 금지)

```bash
git checkout develop
git pull origin develop
git checkout -b feat/2-create-room
```

> GitHub Issue의 `Create branch` 버튼으로 만들어도 됩니다. (기본 브랜치가 `develop`인지 확인)

### 최신 develop 반영

다른 팀원의 PR이 먼저 Merge되었다면, PR을 올리기 전에 반영합니다.

```bash
git checkout develop
git pull origin develop

git checkout feat/2-create-room
git merge develop
```

반영 후 빌드·실행 확인:

| | 빌드 | 실행 |
| --- | --- | --- |
| frontend | `npm run build` | `npm run dev` |
| backend | `./gradlew build` | `./gradlew bootRun` |

---

## 🚀 Pull Request

### PR 전 체크리스트

- [ ] 최신 `develop`을 반영했다
- [ ] 기능을 직접 실행해서 확인했다
- [ ] 빌드가 성공한다 (`npm run build` / `./gradlew build`)
- [ ] **base: `develop`** ← **compare: 내 작업 브랜치** 인지 확인했다
- [ ] 불필요한 `console.log` / `System.out.println`을 지웠다
- [ ] Issue를 연결했다

### 제목

Issue 제목 규칙과 동일합니다. (`feat: 방 생성 API 구현`)

### 템플릿

```markdown
## 🔗 관련 Issue
Closes #12

## ✨ 작업 내용
- 
- 

## 📷 변경 화면 (선택)

## ✅ 체크리스트 (선택)
- [ ]
```

---

## 🔀 Merge

### 규칙

- `main`, `develop`에 **직접 Push 금지**
- 모든 작업은 PR로 Merge
- `develop → main` PR은 배포할 때만

### 절차

1. PR을 올리고 **톡으로 공유** ("~ PR 올렸으니 확인 부탁드립니다")
2. CodeRabbit 리뷰 확인 → 필요하면 수정 후 다시 Push
3. 충돌이 생기면 **PR 작성자**가 해결 후 Push
4. Merge할 팀원이 확인
   - CodeRabbit 주요 리뷰가 처리됐는지
   - PR 설명과 변경 내용이 맞는지
   - GitHub에서 충돌이 없는지
5. **PR 작성자가 아닌 팀원**이 `develop`에 Merge
   - 문서 수정처럼 영향이 작은 작업은 작성자가 직접 Merge 가능
6. Merge 후 **톡으로 공유** → 팀원들은 최신 `develop` pull
7. Merge한 사람이 GitHub에서 `Delete branch`로 작업 브랜치 삭제

> 기능 구현과 자체 테스트는 PR 작성자가 책임집니다.

### 필요할 때만: Merge 테스트

아래처럼 영향이 큰 변경은 임시 브랜치에서 직접 돌려봅니다.
그 외에는 CodeRabbit 리뷰와 PR 내용 확인 후 바로 Merge합니다.

- 로그인/인증, 라우팅, API 연동
- 공통 컴포넌트, 여러 페이지에 영향 있는 변경
- PR 내용이 의심스럽거나 CodeRabbit이 큰 문제를 지적했을 때

```bash
git checkout develop
git pull origin develop
git checkout -b test/pr

git fetch origin
git merge origin/PR브랜치명
# frontend: npm install && npm run build && npm run dev
# backend : ./gradlew build && ./gradlew bootRun
```

- 문제가 있으면 테스트 브랜치에서 고치지 말고 **PR 작성자에게 알리기** → 작성자가 작업 브랜치에서 수정
- 테스트가 끝나면 임시 브랜치 삭제

```bash
git checkout develop
git branch -D test/pr
```
