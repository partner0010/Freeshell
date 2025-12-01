# 모의해킹 테스트 스크립트
# Freeshell 보안 테스트

Write-Host "🔒 모의해킹 테스트 시작..." -ForegroundColor Yellow
Write-Host ""

$baseUrl = "http://localhost:3001/api"
$results = @()

# 1. SQL Injection 테스트
Write-Host "1️⃣ SQL Injection 공격 테스트..." -ForegroundColor Cyan
$sqlPayloads = @(
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "1' OR '1'='1",
    "admin'--"
)

foreach ($payload in $sqlPayloads) {
    try {
        $body = @{
            email = $payload
            username = "test"
            password = "test1234"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            $results += "❌ SQL Injection 취약점 발견: $payload"
        }
    } catch {
        # 400 에러는 정상 (차단됨)
        if ($_.Exception.Response.StatusCode -eq 400) {
            $results += "✅ SQL Injection 차단됨: $payload"
        }
    }
}

# 2. XSS 테스트
Write-Host "2️⃣ XSS 공격 테스트..." -ForegroundColor Cyan
$xssPayloads = @(
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
    "'\"><script>alert('XSS')</script>"
)

foreach ($payload in $xssPayloads) {
    try {
        $body = @{
            topic = $payload
            contentType = "test"
            text = "test"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/content/generate" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -Headers @{"X-API-Key" = "test"} `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        if ($response.Content -match "<script>") {
            $results += "❌ XSS 취약점 발견: $payload"
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            $results += "✅ XSS 차단됨: $payload"
        }
    }
}

# 3. 인증 우회 테스트
Write-Host "3️⃣ 인증 우회 테스트..." -ForegroundColor Cyan

# API Key 없이 접근 시도
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/content/generate" `
        -Method POST `
        -Body '{"topic":"test"}' `
        -ContentType "application/json" `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 200) {
        $results += "❌ 인증 우회 가능: API Key 없이 접근"
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
        $results += "✅ 인증 우회 차단됨: API Key 필수"
    }
}

# 잘못된 JWT 토큰 시도
try {
    $headers = @{
        "Authorization" = "Bearer fake_token_12345"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/user/profile" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 200) {
        $results += "❌ JWT 인증 우회 가능"
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        $results += "✅ JWT 인증 우회 차단됨"
    }
}

# 4. Rate Limiting 테스트
Write-Host "4️⃣ Rate Limiting 테스트..." -ForegroundColor Cyan
$rateLimitTest = 0
for ($i = 1; $i -le 150; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/health" `
            -Method GET `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 429) {
            $rateLimitTest = $i
            break
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            $rateLimitTest = $i
            break
        }
    }
    Start-Sleep -Milliseconds 10
}

if ($rateLimitTest -gt 0) {
    $results += "✅ Rate Limiting 작동: $rateLimitTest 번째 요청에서 차단"
} else {
    $results += "⚠️ Rate Limiting 미작동 또는 느림"
}

# 5. CORS 테스트
Write-Host "5️⃣ CORS 보안 테스트..." -ForegroundColor Cyan
try {
    $headers = @{
        "Origin" = "https://evil.com"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/health" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($response.Headers["Access-Control-Allow-Origin"] -eq "*") {
        $results += "❌ CORS 취약점: 모든 Origin 허용"
    } elseif ($response.Headers["Access-Control-Allow-Origin"] -eq "https://evil.com") {
        $results += "❌ CORS 취약점: 악의적 Origin 허용"
    } else {
        $results += "✅ CORS 보안 정상"
    }
} catch {
    $results += "✅ CORS 차단됨"
}

# 6. 경로 탐색 테스트
Write-Host "6️⃣ 경로 탐색 공격 테스트..." -ForegroundColor Cyan
$pathTraversal = @(
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\config\\sam",
    "....//....//etc/passwd"
)

foreach ($path in $pathTraversal) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/content/$path" `
            -Method GET `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        if ($response.Content -match "root:" -or $response.Content -match "SAM") {
            $results += "❌ 경로 탐색 취약점 발견: $path"
        }
    } catch {
        $results += "✅ 경로 탐색 차단됨: $path"
    }
}

# 결과 출력
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "📊 테스트 결과" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""

$vulnerable = 0
$secure = 0
$warning = 0

foreach ($result in $results) {
    if ($result -match "❌") {
        Write-Host $result -ForegroundColor Red
        $vulnerable++
    } elseif ($result -match "✅") {
        Write-Host $result -ForegroundColor Green
        $secure++
    } else {
        Write-Host $result -ForegroundColor Yellow
        $warning++
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "요약:" -ForegroundColor Cyan
Write-Host "  취약점 발견: $vulnerable" -ForegroundColor $(if ($vulnerable -gt 0) { "Red" } else { "Green" })
Write-Host "  보안 정상: $secure" -ForegroundColor Green
Write-Host "  경고: $warning" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Green

