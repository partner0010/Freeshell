/**
 * 비밀번호 강도 측정기
 */

import { Check, X } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const checks = {
    length: password.length >= 11,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const passedChecks = Object.values(checks).filter(Boolean).length
  const strength = (passedChecks / 5) * 100

  const getStrengthText = () => {
    if (passedChecks === 5) return { text: '매우 강함', color: 'text-green-400' }
    if (passedChecks >= 4) return { text: '강함', color: 'text-blue-400' }
    if (passedChecks >= 3) return { text: '보통', color: 'text-yellow-400' }
    if (passedChecks >= 2) return { text: '약함', color: 'text-orange-400' }
    return { text: '매우 약함', color: 'text-red-400' }
  }

  const strengthInfo = getStrengthText()

  return (
    <div className="space-y-3">
      {/* 강도 바 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">비밀번호 강도</span>
          <span className={`text-sm font-bold ${strengthInfo.color}`}>
            {strengthInfo.text}
          </span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              passedChecks === 5
                ? 'bg-green-500'
                : passedChecks >= 4
                ? 'bg-blue-500'
                : passedChecks >= 3
                ? 'bg-yellow-500'
                : passedChecks >= 2
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* 조건 체크리스트 */}
      <div className="space-y-2">
        <CheckItem checked={checks.length} text="최소 11자 이상" />
        <CheckItem checked={checks.lowercase} text="소문자 포함 (a-z)" />
        <CheckItem checked={checks.uppercase} text="대문자 포함 (A-Z)" />
        <CheckItem checked={checks.number} text="숫자 포함 (0-9)" />
        <CheckItem checked={checks.special} text="특수문자 포함 (!@#$%...)" />
      </div>
    </div>
  )
}

function CheckItem({ checked, text }: { checked: boolean; text: string }) {
  return (
    <div className="flex items-center space-x-2">
      {checked ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <X className="w-4 h-4 text-gray-600" />
      )}
      <span className={`text-sm ${checked ? 'text-green-400' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  )
}

