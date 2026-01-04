# 무료 API 키 설정 가이드

## 🎯 목표
Shell에서 무료로 사용 가능한 모든 AI/API를 통합하여 한 곳에서 사용할 수 있도록 합니다.

## 📋 필요한 API 키 목록

### 필수 (하나 이상 필요)

#### 1. Google Gemini API (필수) ⭐
- **용도**: 텍스트 생성, 번역, AI 검색, Spark 워크스페이스
- **무료 티어**: 제공됨
- **발급 링크**: https://makersuite.google.com/app/apikey
- **설정 방법**:
  1. Google 계정으로 로그인
  2. "Create API Key" 클릭
  3. 생성된 키를 Netlify 환경 변수에 추가: `GOOGLE_API_KEY`

### 선택 (원하는 기능만 사용)

#### 2. Pexels API (이미지 검색용)
- **용도**: 이미지 검색
- **무료**: 완전 무료
- **발급 링크**: https://www.pexels.com/api/
- **설정 방법**:
  1. Pexels 계정 생성
  2. API 키 발급
  3. Netlify 환경 변수에 추가: `PEXELS_API_KEY`

#### 3. Unsplash API (이미지 검색용)
- **용도**: 이미지 검색
- **무료 티어**: 제공됨
- **발급 링크**: https://unsplash.com/developers
- **설정 방법**:
  1. Unsplash 개발자 계정 생성
  2. New Application 생성
  3. Access Key 복사
  4. Netlify 환경 변수에 추가: `UNSPLASH_ACCESS_KEY`

#### 4. Pixabay API (이미지 검색용)
- **용도**: 이미지 검색
- **무료 티어**: 제공됨
- **발급 링크**: https://pixabay.com/api/docs/
- **설정 방법**:
  1. Pixabay 계정 생성
  2. API 키 발급
  3. Netlify 환경 변수에 추가: `PIXABAY_API_KEY`

#### 5. Hugging Face API (추가 텍스트 AI)
- **용도**: 추가 AI 모델 사용
- **무료 티어**: 제공됨
- **발급 링크**: https://huggingface.co/settings/tokens
- **설정 방법**:
  1. Hugging Face 계정 생성
  2. Settings → Access Tokens → New token
  3. Netlify 환경 변수에 추가: `HUGGINGFACE_API_KEY`

#### 6. Groq API (빠른 텍스트 생성)
- **용도**: 매우 빠른 텍스트 생성
- **무료 티어**: 제공됨
- **발급 링크**: https://console.groq.com/
- **설정 방법**:
  1. Groq 계정 생성
  2. API Keys → Create API Key
  3. Netlify 환경 변수에 추가: `GROQ_API_KEY`

## 🚀 Netlify 환경 변수 설정 방법

1. **Netlify 대시보드 접속**: https://app.netlify.com
2. **사이트 선택**: freeshell.co.kr
3. **Site settings** → **Environment variables**
4. **Add a variable** 클릭
5. Key와 Value 입력
6. **Save** 클릭
7. **재배포**: Deploys 탭 → Trigger deploy

## 📝 최소 설정 (기본 기능 사용)

최소한 다음 API 키만 설정하면 기본 기능을 사용할 수 있습니다:
- `GOOGLE_API_KEY` (필수)

## 📝 권장 설정 (모든 기능 사용)

모든 무료 기능을 사용하려면:
- `GOOGLE_API_KEY` (필수)
- `PEXELS_API_KEY` (선택, 이미지 검색)
- `UNSPLASH_ACCESS_KEY` (선택, 이미지 검색)
- `PIXABAY_API_KEY` (선택, 이미지 검색)

## ✅ API 키 없이 사용 가능한 기능

다음 기능들은 API 키 없이도 사용 가능합니다:
- **웹 검색**: DuckDuckGo + Wikipedia (완전 무료, API 키 불필요)

## 📊 기능별 필요한 API 키

| 기능 | 필수 API 키 | 선택 API 키 |
|------|------------|------------|
| AI 검색 엔진 | GOOGLE_API_KEY | - |
| Spark 워크스페이스 | GOOGLE_API_KEY | - |
| 번역 | GOOGLE_API_KEY | - |
| 웹 검색 | 없음 (완전 무료) | - |
| 이미지 검색 | 없음 (하나 이상 권장) | PEXELS_API_KEY, UNSPLASH_ACCESS_KEY, PIXABAY_API_KEY |

## 💡 팁

1. **이미지 검색**: Pexels, Unsplash, Pixabay 중 하나만 설정해도 사용 가능합니다.
2. **다중 이미지 소스**: 여러 API 키를 설정하면 더 많은 이미지를 검색할 수 있습니다.
3. **무료 제한**: 각 API는 무료 티어 제한이 있을 수 있습니다. 사용량을 확인하세요.

