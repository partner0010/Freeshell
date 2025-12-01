# 서버 보안 설정 가이드

## 🔒 필수 보안 설정

### 1. SSH 보안 강화

```bash
# SSH 설정 파일 수정
sudo nano /etc/ssh/sshd_config
```

다음 설정 변경:

```config
# 비밀번호 로그인 비활성화 (키만 사용)
PasswordAuthentication no
PubkeyAuthentication yes

# 루트 로그인 비활성화
PermitRootLogin no

# 포트 변경 (선택)
Port 2222
```

재시작:

```bash
sudo systemctl restart sshd
```

### 2. SSH 키 생성 및 설정

로컬 컴퓨터에서:

```bash
# SSH 키 생성
ssh-keygen -t rsa -b 4096

# 서버에 키 복사
ssh-copy-id root@your-server-ip
```

### 3. 방화벽 설정

```bash
# UFW 활성화
sudo ufw enable

# 필요한 포트만 열기
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3001/tcp # API (개발용, 프로덕션에서는 Nginx 사용)

# 상태 확인
sudo ufw status
```

### 4. 자동 보안 업데이트

```bash
# unattended-upgrades 설치
sudo apt-get install -y unattended-upgrades

# 설정
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 5. .env 파일 보안

```bash
# 권한 설정 (소유자만 읽기/쓰기)
chmod 600 .env

# .env 파일은 절대 Git에 커밋하지 않기
echo ".env" >> .gitignore
```

### 6. 데이터베이스 보안

```bash
# SQLite 파일 권한 설정
chmod 600 data/database.db
chown $USER:$USER data/database.db
```

### 7. 로그 모니터링

```bash
# 실패한 로그인 시도 확인
sudo grep "Failed password" /var/log/auth.log

# 의심스러운 활동 확인
sudo last
```

---

## 🛡️ 추가 보안 조치

### Fail2Ban 설치 (무차별 대입 공격 방지)

```bash
# 설치
sudo apt-get install -y fail2ban

# 설정
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 정기 백업

```bash
# 백업 스크립트 생성
nano /opt/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 데이터베이스 백업
cp /opt/all-in-one-content-ai/backend/data/database.db \
   $BACKUP_DIR/database_$DATE.db

# 업로드 파일 백업
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz \
    /opt/all-in-one-content-ai/backend/uploads

# 오래된 백업 삭제 (7일 이상)
find $BACKUP_DIR -type f -mtime +7 -delete
```

실행 권한 부여:

```bash
chmod +x /opt/backup.sh
```

Cron으로 자동 실행:

```bash
# 매일 새벽 3시에 백업
crontab -e
# 다음 줄 추가:
0 3 * * * /opt/backup.sh
```

---

## ✅ 보안 체크리스트

배포 전 확인:

- [ ] SSH 키 인증 설정
- [ ] 비밀번호 로그인 비활성화
- [ ] 방화벽 설정 완료
- [ ] 불필요한 포트 차단
- [ ] .env 파일 권한 설정 (600)
- [ ] 자동 업데이트 활성화
- [ ] SSL 인증서 설치 (HTTPS)
- [ ] 백업 설정 완료
- [ ] 로그 모니터링 설정
- [ ] Fail2Ban 설치 (선택)

---

## 🚨 보안 사고 대응

### 의심스러운 활동 발견 시

1. **즉시 서버 접속 차단**
   ```bash
   sudo ufw deny from [의심스러운 IP]
   ```

2. **로그 확인**
   ```bash
   sudo tail -f /var/log/auth.log
   sudo tail -f /opt/all-in-one-content-ai/backend/logs/combined.log
   ```

3. **비밀번호 변경**
   ```bash
   passwd
   ```

4. **API 키 재생성**
   - OpenAI/Claude API 키 재생성
   - .env 파일 업데이트

---

## 📞 보안 관련 문의

문제 발생 시:
1. 서버 로그 확인
2. 방화벽 로그 확인
3. 업체 고객 지원 문의

