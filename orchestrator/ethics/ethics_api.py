"""
Ethics Guard FastAPI 엔드포인트
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import os
import uuid
import shutil

from .ethics_guard_v2 import EthicsGuardV2, ConsentData, ContentType, PurposeType
from .blocking_flow_v2 import BlockingFlowV2
from .user_notification_v2 import NotificationManagerV2
from ..utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(title="Ethics Guard API")

# 전역 변수
ethics_guard = EthicsGuardV2()
blocking_flow = BlockingFlowV2(ethics_guard)
notification_manager = NotificationManagerV2()

# 동의서 저장 디렉토리
consent_dir = "storage/consents"
os.makedirs(consent_dir, exist_ok=True)


class ConsentRequest(BaseModel):
    """동의 요청"""
    user_id: str
    content_type: str
    purpose: str
    subject_name: str
    subject_status: str  # "deceased", "living", "historical"
    consent_type: str  # "self", "legal_guardian", "family"
    commercial_use: bool = False
    third_party_share: bool = False


class ContentRequest(BaseModel):
    """콘텐츠 생성 요청"""
    prompt: str
    content_type: str = "text"
    purpose: str = "personal_archive"
    subject_name: Optional[str] = None
    subject_status: Optional[str] = None
    user_id: str


@app.post("/api/ethics/consent")
async def register_consent(
    request: ConsentRequest,
    proof_file: Optional[UploadFile] = File(None)
):
    """동의 등록"""
    try:
        # 증명서 저장
        consent_proof = ""
        if proof_file:
            proof_id = str(uuid.uuid4())
            proof_ext = os.path.splitext(proof_file.filename)[1] or '.pdf'
            proof_path = os.path.join(consent_dir, f"{proof_id}{proof_ext}")
            
            with open(proof_path, "wb") as buffer:
                shutil.copyfileobj(proof_file.file, buffer)
            
            consent_proof = proof_path
        
        # 동의 데이터 생성
        consent = ConsentData(
            user_id=request.user_id,
            content_type=ContentType(request.content_type),
            purpose=PurposeType(request.purpose),
            subject_name=request.subject_name,
            subject_status=request.subject_status,
            consent_type=request.consent_type,
            consent_proof=consent_proof,
            consent_date=datetime.now(),
            commercial_use=request.commercial_use,
            third_party_share=request.third_party_share
        )
        
        # 동의 등록
        success, consent_id = ethics_guard.register_consent(consent)
        
        if not success:
            raise HTTPException(status_code=400, detail="Invalid consent data")
        
        return JSONResponse({
            'success': True,
            'consent_id': consent_id,
            'message': 'Consent registered successfully'
        })
        
    except Exception as e:
        logger.error(f"Consent registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ethics/check")
async def check_request(request: ContentRequest):
    """요청 검증"""
    try:
        user_input = {
            'prompt': request.prompt,
            'content_type': request.content_type,
            'purpose': request.purpose,
            'subject_name': request.subject_name or '',
            'subject_status': request.subject_status or 'unknown',
            'user_id': request.user_id
        }
        
        # 차단 플로우 처리
        result = await blocking_flow.process_request(user_input, request.user_id)
        
        # 고지 생성
        notifications = []
        if not result['allowed']:
            risk_assessment = result.get('risk_assessment', {})
            notifications = notification_manager.get_notification_sequence(
                purpose=PurposeType(request.purpose),
                content_type=ContentType(request.content_type),
                subject_status=request.subject_status or 'unknown',
                has_consent=result.get('required_consent') is not None,
                risk_assessment=risk_assessment
            )
        
        return JSONResponse({
            'allowed': result['allowed'],
            'action': result['action'],
            'risk_assessment': result['risk_assessment'],
            'message': result['message'],
            'notifications': [n.to_dict() for n in notifications]
        })
        
    except Exception as e:
        logger.error(f"Request check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ethics/escalations")
async def get_escalations():
    """에스컬레이션 큐 조회 (관리자용)"""
    escalations = blocking_flow.get_escalation_queue()
    return JSONResponse({
        'escalations': escalations,
        'count': len(escalations)
    })


@app.post("/api/ethics/resolve/{escalation_id}")
async def resolve_escalation(escalation_id: int, decision: str):
    """에스컬레이션 해결 (관리자용)"""
    blocking_flow.resolve_escalation(escalation_id, decision)
    return JSONResponse({
        'success': True,
        'message': 'Escalation resolved'
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
