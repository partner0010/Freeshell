# PowerShell 환경 변수 검증 스크립트

param(
    [string]$Env = "production"
)

$envFile = ".env.$Env"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: $envFile file not found" -ForegroundColor Red
    exit 1
}

Write-Host "Verifying environment variables in $envFile..." -ForegroundColor Green

# 환경 파일 로드
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# 필수 변수 목록
$requiredVars = @(
    "DATABASE_URL",
    "REDIS_URL",
    "JWT_SECRET",
    "SECRET_KEY",
    "OPENAI_API_KEY",
    "AWS_S3_BUCKET",
    "STRIPE_SECRET_KEY"
)

$errors = 0
$warnings = 0

foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "❌ Error: $var is not set" -ForegroundColor Red
        $errors++
    }
    elseif ($value -match "CHANGE_ME|your-|example") {
        Write-Host "⚠️  Warning: $var appears to have a placeholder value" -ForegroundColor Yellow
        $warnings++
    }
    else {
        Write-Host "✅ $var is set" -ForegroundColor Green
    }
}

# JWT_SECRET 길이 확인
$jwtSecret = [Environment]::GetEnvironmentVariable("JWT_SECRET", "Process")
if ($jwtSecret -and $jwtSecret.Length -lt 32) {
    Write-Host "⚠️  Warning: JWT_SECRET should be at least 32 characters (current: $($jwtSecret.Length))" -ForegroundColor Yellow
    $warnings++
}

# 결과 출력
Write-Host ""
Write-Host "Verification complete:" -ForegroundColor Cyan
Write-Host "  Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "  Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })

if ($errors -gt 0) {
    Write-Host ""
    Write-Host "❌ Environment verification failed. Please fix the errors above." -ForegroundColor Red
    exit 1
}
elseif ($warnings -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Environment verification passed with warnings." -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host ""
    Write-Host "✅ Environment verification passed." -ForegroundColor Green
    exit 0
}
