"""
Ethics Guard 통합 예시
"""

import asyncio
from datetime import datetime
from orchestrator.ethics import (
    EthicsGuard,
    BlockingFlow,
    NotificationManager,
    ConsentData,
    ContentType,
    PurposeType
)


async def main():
    """메인 함수"""
    # 1. Ethics Guard 초기화
    ethics_guard = EthicsGuard()
    blocking_flow = BlockingFlow(ethics_guard)
    notification_manager = NotificationManager()
    
    # 2. 동의 등록 예시
    consent = ConsentData(
        user_id="user_001",
        content_type=ContentType.VOICE,
        purpose=PurposeType.MEMORIAL,
        subject_name="홍길동",
        subject_status="deceased",
        consent_type="legal_guardian",
        consent_proof="consent_doc_001.pdf",
        consent_date=datetime.now(),
        commercial_use=False,
        third_party_share=False
    )
    
    registered = ethics_guard.register_consent(consent)
    print(f"Consent registered: {registered}")
    
    # 3. 요청 처리
    user_input = {
        'prompt': '고인에 대한 추모 음성을 생성해주세요',
        'content_type': 'voice',
        'purpose': 'memorial',
        'subject_name': '홍길동',
        'user_id': 'user_001'
    }
    
    result = await blocking_flow.process_request(user_input, 'user_001')
    print(f"Request allowed: {result['allowed']}")
    print(f"Action: {result['action']}")
    print(f"Message: {result['message']}")
    
    # 4. 사용자 고지 생성
    if result['allowed']:
        notifications = notification_manager.get_notification_sequence(
            purpose=PurposeType.MEMORIAL,
            content_type=ContentType.VOICE,
            subject_status="deceased",
            has_consent=True
        )
        
        for notif in notifications:
            print(f"\n[{notif.type.value}] {notif.title}")
            print(notif.message)


if __name__ == "__main__":
    asyncio.run(main())
