# 프로젝트 확인 방법 가이드

## 🚀 빠른 시작

### 1단계: 의존성 설치

터미널(또는 PowerShell)을 열고 프로젝트 폴더로 이동한 후 다음 명령어를 실행하세요:

```bash
npm install
```

이 명령어는 프로젝트에 필요한 모든 패키지를 설치합니다 (약 1-2분 소요).

### 2단계: 개발 서버 실행

의존성 설치가 완료되면 다음 명령어로 개발 서버를 시작하세요:

```bash
npm run dev
```

서버가 시작되면 다음과 같은 메시지가 표시됩니다:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3단계: 브라우저에서 확인

브라우저를 열고 다음 주소로 접속하세요:
- **http://localhost:3000**

자동으로 브라우저가 열리지 않으면 위 주소를 직접 입력하세요.

## 📱 확인할 수 있는 기능들

### ✅ 현재 작동하는 기능
1. **홈 페이지** - 프로젝트 소개 및 기능 안내
2. **콘텐츠 생성 페이지** - 폼 작성 및 입력
3. **미리보기 페이지** - 생성된 콘텐츠 확인 (시뮬레이션 데이터)
4. **설정 페이지** - 플랫폼 연동 관리

### ⚠️ 아직 구현 중인 기능
- 실제 AI 콘텐츠 생성 (현재는 시뮬레이션 데이터 표시)
- 실제 플랫폼 업로드 (백엔드 API 필요)

## 🔧 문제 해결

### ⚠️ PowerShell 실행 정책 오류 (가장 흔한 문제)

PowerShell에서 `npm` 명령어 실행 시 다음과 같은 오류가 발생할 수 있습니다:
```
npm : 이 시스템에서 스크립트를 실행할 수 없으므로 ... npm.ps1을 로드할 수 없습니다.
```

**✅ 해결 방법 1: npm.cmd 직접 사용 (가장 간단, 권장!)**
현재 PowerShell에서 그대로 다음과 같이 입력하세요:
```powershell
npm.cmd install
```
설치 완료 후:
```powershell
npm.cmd run dev
```

**해결 방법 2: CMD 사용**
PowerShell 대신 **명령 프롬프트(CMD)**를 사용하세요:
1. Windows 키 + R
2. `cmd` 입력 후 Enter
3. 프로젝트 폴더로 이동: `cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\TinTop"`
4. `npm install` 실행
5. `npm run dev` 실행

**해결 방법 3: PowerShell 실행 정책 변경 (영구적 해결)**
관리자 권한으로 PowerShell을 열고 다음 명령어를 실행하세요:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
그 후 `Y`를 입력하여 확인하세요.

### 포트가 이미 사용 중인 경우
다른 포트를 사용하려면 `vite.config.ts` 파일을 수정하세요:
```typescript
server: {
  port: 3001, // 원하는 포트 번호로 변경
}
```

### 패키지 설치 오류
다음 명령어로 캐시를 지우고 다시 설치하세요:
```bash
npm cache clean --force
npm install
```

### Node.js 버전 확인
Node.js 18 이상이 필요합니다:
```bash
node --version
```

## 📂 프로젝트 구조

```
TinTop/
├── src/
│   ├── pages/          # 페이지 컴포넌트
│   ├── components/     # 재사용 컴포넌트
│   ├── store/          # 상태 관리
│   ├── services/       # API 서비스
│   └── types/          # TypeScript 타입
├── public/             # 정적 파일
└── package.json        # 프로젝트 설정
```

## 🎨 테스트 시나리오

1. **홈 페이지 확인**
   - 메인 화면의 디자인 확인
   - 기능 소개 카드 확인

2. **콘텐츠 생성 테스트**
   - "콘텐츠 생성 시작하기" 버튼 클릭
   - 주제 입력
   - 콘텐츠 유형 선택
   - 시간 조절
   - 콘텐츠 형식 선택
   - 텍스트 입력
   - "AI로 콘텐츠 생성하기" 버튼 클릭

3. **미리보기 확인**
   - 생성된 5가지 버전 확인
   - 각 버전의 썸네일 및 설명 확인
   - 버전 선택 및 상세 정보 확인

4. **설정 페이지**
   - 플랫폼 추가 버튼 클릭
   - 플랫폼 선택 및 정보 입력

## 💡 다음 단계

실제 AI 기능을 사용하려면:
1. 백엔드 API 서버 구축
2. OpenAI 또는 Claude API 키 설정
3. YouTube Data API 연동

자세한 내용은 `backend/README.md`를 참고하세요.

