# 🔧 Prisma Schema 위치 수정

## 문제
- Prisma schema가 `.github/prisma/schema.prisma`에 있음
- Prisma는 기본적으로 프로젝트 루트의 `prisma/schema.prisma`를 찾음
- Vercel 빌드 시 schema를 찾지 못해 오류 발생

## 해결 방법

### 1단계: 프로젝트 루트에 prisma 폴더 생성

프로젝트 루트 (`C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell`)에서:

```bash
mkdir prisma
```

### 2단계: schema.prisma 복사

```bash
copy .github\prisma\schema.prisma prisma\schema.prisma
```

또는 수동으로:
1. `.github/prisma/schema.prisma` 파일 열기
2. 전체 내용 복사
3. 프로젝트 루트에 `prisma/schema.prisma` 파일 생성
4. 내용 붙여넣기

### 3단계: 변경사항 커밋 및 푸시

```bash
git add prisma/schema.prisma
git commit -m "fix: move Prisma schema to standard location"
git push origin main
```

---

## ✅ 확인

프로젝트 루트에 다음 파일이 있어야 합니다:
- `prisma/schema.prisma` ✅
- `package.json` ✅ (이미 있음)
- `next.config.js` ✅

---

## 📝 참고

- `.github/prisma/schema.prisma`는 백업으로 유지 가능
- 또는 삭제해도 됨 (표준 위치로 이동했으므로)

