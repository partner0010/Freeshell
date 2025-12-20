# 빌드 오류 수정 가이드 (통합)

## 🔴 주요 빌드 오류 및 해결 방법

### 1. bcryptjs 모듈 누락

**오류:**
```
Module not found: Can't resolve 'bcryptjs'
```

**해결:**
1. `package.json`에 추가:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

2. 설치 및 커밋:
```bash
npm install bcryptjs @types/bcryptjs
git add package.json package-lock.json
git commit -m "fix: add bcryptjs dependency"
git push origin main
```

### 2. next-auth 모듈 누락

**오류:**
```
Module not found: Can't resolve 'next-auth'
```

**해결:**
```bash
npm install next-auth@4
git add package.json package-lock.json
git commit -m "fix: add next-auth dependency"
git push origin main
```

### 3. ESLint 오류

**오류:**
```
Definition for rule '@typescript-eslint/...' was not found
```

**해결:**
`next.config.js`에 추가:
```js
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ... 기타 설정
};
```

### 4. TypeScript 타입 오류 (next-auth)

**오류:**
```
Type 'AuthOptions' is not assignable to type 'never'
```

**해결:**
`src/app/api/auth/[...nextauth]/route.ts` 파일 수정:
```typescript
import NextAuth from 'next-auth';
import { authOptions } from './authOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

또는 `authOptions`를 별도 파일로 분리:
```typescript
// src/lib/auth/options.ts
export const authOptions = { ... };

// src/app/api/auth/[...nextauth]/route.ts
import { authOptions } from '@/lib/auth/options';
```

## 🚀 빠른 수정 스크립트

```bash
.github\fix-build.bat
```

## 📝 확인 체크리스트

- [ ] package.json에 bcryptjs와 next-auth 확인
- [ ] next.config.js에 eslint.ignoreDuringBuilds 확인
- [ ] 로컬에서 `npm run build` 성공 확인
- [ ] 변경사항 커밋 및 푸시

