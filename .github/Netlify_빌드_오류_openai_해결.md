# 🔧 Netlify 빌드 오류 해결 - openai

## 오류 원인

**오류 메시지:**
```
Type error: Cannot find module 'openai' or its corresponding type declarations.
```

`src/lib/ai/nanobana.ts` 파일에서 `openai`를 사용하고 있지만 `package.json`에 없어서 빌드가 실패했습니다.

---

## 해결 방법

### package.json 수정 완료 ✅

`openai` 패키지를 `dependencies`에 추가했습니다:
- `openai`: `^4.20.0`

---

## 다음 단계

### 1. Git에 푸시 (필수!)

프로젝트 루트에서 다음 명령어 실행:

```cmd
git add package.json
git commit -m "fix: add missing openai package"
git push origin main
```

### 2. Netlify에서 자동 재배포

Git 푸시 후 Netlify에서 자동으로 재배포가 시작됩니다.

---

## 확인 체크리스트

- [x] package.json에 openai 패키지 추가
- [ ] Git에 푸시
- [ ] Netlify에서 재배포 확인
- [ ] 빌드 성공 확인

---

## 🚀 지금 바로 하세요!

프로젝트 루트에서:

```cmd
git add package.json
git commit -m "fix: add missing openai package"
git push origin main
```

**이제 빌드가 성공할 것입니다!** ✅

