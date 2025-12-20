# 프로젝트 전체 정리 가이드

## 📋 정리 계획

### 1. .github 폴더 정리
- 중복 문서 파일 삭제 (통합본으로 대체)
- 중복 배치 파일 삭제 (통합본으로 대체)

### 2. src/lib 폴더 정리
- 중복 폴더 확인 및 통합
- 사용하지 않는 파일 삭제

### 3. public 폴더 정리
- 불필요한 파일 삭제

### 4. 루트 폴더 정리
- 중복 문서 삭제

## 🔍 발견된 중복 항목

### src/lib 중복 폴더
1. **scheduling vs scheduler**
   - `lib/scheduling/scheduler.ts` - 사용 여부 확인 필요
   - `lib/scheduler/task-scheduler.ts` - 사용 중

2. **documentation vs docs**
   - `lib/documentation/interactive-docs.ts` - 사용 여부 확인 필요
   - `lib/docs/documentation-generator.ts` - 사용 중

### 불필요한 파일
- `public/next.config.optimized.js` - 루트에 있어야 함
- `src/lib/integrations/grip-bridge.ts` - GRIP 브랜딩 제거됨, 삭제 가능

## ✅ 정리 실행

프로젝트 루트에서 실행:
```bash
.github\cleanup-project.bat
```

## 📝 정리 후 구조

### .github 폴더
- `README.md` - 메인 가이드
- `BUILD_ERRORS.md` - 빌드 오류 통합 가이드
- `DOMAIN_ACCESS_GUIDE.md` - 도메인 접속 가이드
- `fix-build.bat` - 빌드 오류 수정
- `deploy.bat` - 배포
- `preview-local.bat` - 로컬 프리뷰
- `cleanup-project.bat` - 정리 스크립트

### src/lib 폴더
- 중복 폴더 통합
- 사용하지 않는 파일 삭제

## ⚠️ 주의사항

정리 전에:
1. Git 커밋 확인
2. 백업 권장
3. 사용 중인 파일인지 확인

