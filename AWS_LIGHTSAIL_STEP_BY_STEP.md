# AWS Lightsail 단계별 가이드 (초보자용)

## 🎯 목표
AWS Lightsail에서 서버 생성하기

---

## 📋 1단계: Lightsail 접속

### 현재 위치 확인
- ✅ AWS 콘솔에 로그인되어 있음
- 다음 단계 진행

### Lightsail 찾기
1. AWS 콘솔 상단 검색창에 **"Lightsail"** 입력
2. **"Amazon Lightsail"** 클릭
3. 또는 직접 접속: https://lightsail.aws.amazon.com

---

## 📋 2단계: 인스턴스 생성 시작

### 화면에서 찾기
1. Lightsail 대시보드가 보임
2. **"Create instance"** 버튼 클릭 (큰 파란색 버튼)
   - 또는 **"인스턴스 만들기"** (한국어)

---

## 📋 3단계: 지역 선택

### 화면 구성
- 왼쪽에 지역 목록이 보임
- 오른쪽에 지도가 보임

### 선택 방법
1. **"Asia Pacific (Seoul)"** 찾기
   - 또는 **"ap-northeast-2"** (서울 리전 코드)
2. 클릭하여 선택
3. ✅ 체크 표시가 나타남

**중요**: 반드시 **서울(Seoul)** 선택! (한국에서 가장 빠름)

---

## 📋 4단계: 플랫폼 선택

### 화면 구성
- **"Platform"** 또는 **"플랫폼"** 섹션

### 선택 방법
1. **"Linux/Unix"** 선택
   - Windows가 아닌 Linux 선택!

---

## 📋 5단계: 블루프린트(이미지) 선택

### 화면 구성
- 여러 운영체제 옵션이 보임

### 선택 방법
1. **"Ubuntu"** 찾기
2. **"Ubuntu 22.04 LTS"** 선택 (최신 버전)
   - 또는 Ubuntu 20.04 LTS도 가능

---

## 📋 6단계: 플랜(사양) 선택

### 화면 구성
- 여러 가격대의 플랜이 보임
- 왼쪽에서 오른쪽으로 갈수록 비쌈

### 선택 방법
1. **가장 왼쪽 플랜** 찾기
2. **"$3.50 USD/month"** 선택
   - 또는 **"512 MB RAM, 1 vCPU"** 표시된 것
3. 사양 확인:
   - RAM: 512 MB
   - vCPU: 1
   - SSD: 20 GB
   - 데이터 전송: 1 TB

**중요**: 가장 저렴한 $3.50 플랜 선택!

---

## 📋 7단계: 인스턴스 이름 설정

### 화면 구성
- **"Identify your instance"** 또는 **"인스턴스 식별"** 섹션

### 입력 방법
1. **"Instance name"** 입력란에 입력:
   ```
   all-in-one-content-ai
   ```
   - 또는 원하는 이름 (예: my-content-server)

---

## 📋 8단계: SSH 키 설정 (선택)

### 화면 구성
- **"SSH key pair"** 또는 **"SSH 키 쌍"** 섹션

### 선택 방법
1. **"Create new"** 또는 **"새로 만들기"** 선택
   - 자동으로 키가 생성됨
2. 또는 기존 키가 있으면 선택

**참고**: 나중에 다운로드 가능하므로 걱정 안 해도 됨

---

## 📋 9단계: 생성 완료!

### 확인
1. 모든 설정 확인
2. **"Create instance"** 또는 **"인스턴스 만들기"** 버튼 클릭
3. **2-3분 대기** (인스턴스 생성 중)

### 완료 표시
- 화면에 **"Your instance is running"** 또는 **"인스턴스가 실행 중입니다"** 표시
- 초록색 체크 표시

---

## 📋 10단계: 서버 정보 확인

### IP 주소 확인
1. 생성된 인스턴스 클릭
2. **"Networking"** 탭 클릭
3. **"Public IP"** 또는 **"퍼블릭 IP"** 확인
   - 예: `52.78.123.45`

### SSH 접속 정보
- **사용자명**: `ubuntu` (기본)
- **포트**: 22

---

## 📋 11단계: SSH 접속 테스트

### 방법 1: 브라우저에서 (가장 간단!)

1. Lightsail 대시보드에서
2. 생성된 인스턴스 클릭
3. **"Connect using SSH"** 또는 **"SSH를 사용하여 연결"** 버튼 클릭
4. 브라우저에서 터미널이 열림!

### 방법 2: 로컬 컴퓨터에서

```bash
# SSH 키 다운로드 (Lightsail 대시보드에서)
# Account → SSH keys → 다운로드

# 접속
ssh -i [다운로드한키파일].pem ubuntu@[서버IP]
```

---

## 🚀 다음 단계: 배포하기

서버 IP를 받았으면:

```bash
cd backend
chmod +x scripts/quick-deploy.sh
./scripts/quick-deploy.sh [서버IP] ubuntu
```

**예시**:
```bash
./scripts/quick-deploy.sh 52.78.123.45 ubuntu
```

---

## ❓ 자주 묻는 질문

### Q: Lightsail을 찾을 수 없어요
**A**: 상단 검색창에 "Lightsail" 입력

### Q: 서울 리전이 안 보여요
**A**: 지역 목록에서 "Asia Pacific" 섹션 찾기

### Q: $3.50 플랜이 안 보여요
**A**: 스크롤해서 가장 왼쪽(저렴한) 플랜 찾기

### Q: 생성이 오래 걸려요
**A**: 정상입니다. 2-3분 소요

### Q: IP 주소를 못 찾겠어요
**A**: 인스턴스 클릭 → Networking 탭 → Public IP

---

## 🎯 체크리스트

진행 상황 확인:

- [ ] Lightsail 접속 완료
- [ ] Create instance 클릭
- [ ] 서울 리전 선택
- [ ] Linux/Unix 선택
- [ ] Ubuntu 선택
- [ ] $3.50 플랜 선택
- [ ] 인스턴스 이름 입력
- [ ] Create instance 클릭
- [ ] 생성 완료 대기
- [ ] IP 주소 확인

---

## 📞 도움이 필요하면

1. **AWS 문서**: https://lightsail.aws.amazon.com/ls/docs
2. **AWS 지원**: AWS 콘솔 → Support

---

## ✅ 완료!

인스턴스가 생성되면 IP 주소를 알려주세요!
배포를 도와드리겠습니다! 🚀

