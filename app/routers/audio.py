"""
音频处理路由
处理音频文件上传、转写等功能
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import AudioRecord, Transcription, User
from app.schemas import AudioRecordResponse, TranscriptionResponse, APIResponse
from app.services.audio_service import AudioService
from app.services.ai_service import AIService
from app.core.config import settings
import os

router = APIRouter()
audio_service = AudioService()
ai_service = AIService()

@router.post("/upload", response_model=APIResponse)
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    上传音频文件
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 验证文件
        if not audio_service.validate_audio_file(file):
            raise HTTPException(status_code=400, detail="文件格式或大小不符合要求")
        
        # 保存文件
        file_info = await audio_service.save_upload_file(file)
        
        # 创建音频记录
        audio_record = AudioRecord(
            user_id=user_id,
            filename=file_info["filename"],
            file_path=file_info["file_path"],
            file_size=file_info["file_size"],
            duration=file_info["duration"],
            format=file_info["format"],
            status="uploaded"
        )
        db.add(audio_record)
        db.commit()
        db.refresh(audio_record)
        
        # 后台任务：转写音频
        background_tasks.add_task(
            transcribe_audio_background,
            audio_record.id,
            file_info["file_path"]
        )
        
        return APIResponse(
            message="音频文件上传成功，正在后台转写",
            data={
                "audio_record_id": audio_record.id,
                "filename": audio_record.filename,
                "status": audio_record.status
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败：{str(e)}")

@router.get("/records/{user_id}", response_model=APIResponse)
async def get_user_audio_records(
    user_id: int,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db)
):
    """
    获取用户的音频记录列表
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 分页查询
        offset = (page - 1) * size
        records = db.query(AudioRecord).filter(
            AudioRecord.user_id == user_id
        ).offset(offset).limit(size).all()
        
        total = db.query(AudioRecord).filter(
            AudioRecord.user_id == user_id
        ).count()
        
        return APIResponse(
            message="获取音频记录成功",
            data={
                "records": [
                    {
                        "id": record.id,
                        "filename": record.filename,
                        "duration": record.duration,
                        "format": record.format,
                        "status": record.status,
                        "created_at": record.created_at.isoformat()
                    }
                    for record in records
                ],
                "pagination": {
                    "page": page,
                    "size": size,
                    "total": total,
                    "pages": (total + size - 1) // size
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取记录失败：{str(e)}")

@router.get("/record/{record_id}", response_model=APIResponse)
async def get_audio_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    """
    获取单个音频记录详情
    """
    try:
        record = db.query(AudioRecord).filter(
            AudioRecord.id == record_id
        ).first()
        
        if not record:
            raise HTTPException(status_code=404, detail="音频记录不存在")
        
        # 获取转写信息
        transcription = db.query(Transcription).filter(
            Transcription.audio_record_id == record_id
        ).first()
        
        return APIResponse(
            message="获取音频记录成功",
            data={
                "record": {
                    "id": record.id,
                    "filename": record.filename,
                    "duration": record.duration,
                    "format": record.format,
                    "status": record.status,
                    "created_at": record.created_at.isoformat()
                },
                "transcription": {
                    "id": transcription.id,
                    "text": transcription.text,
                    "confidence": transcription.confidence,
                    "language": transcription.language,
                    "created_at": transcription.created_at.isoformat()
                } if transcription else None
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取记录失败：{str(e)}")

@router.delete("/record/{record_id}", response_model=APIResponse)
async def delete_audio_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    """
    删除音频记录
    """
    try:
        record = db.query(AudioRecord).filter(
            AudioRecord.id == record_id
        ).first()
        
        if not record:
            raise HTTPException(status_code=404, detail="音频记录不存在")
        
        # 删除文件
        if os.path.exists(record.file_path):
            await audio_service.delete_file(record.file_path)
        
        # 删除数据库记录
        db.delete(record)
        db.commit()
        
        return APIResponse(message="音频记录删除成功")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败：{str(e)}")

async def transcribe_audio_background(audio_record_id: int, file_path: str):
    """
    后台音频转写任务
    """
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # 更新状态为处理中
        record = db.query(AudioRecord).filter(
            AudioRecord.id == audio_record_id
        ).first()
        
        if record:
            record.status = "processing"
            db.commit()
        
        # 执行转写
        transcription_result = await ai_service.transcribe_audio(file_path)
        
        # 保存转写结果
        transcription = Transcription(
            audio_record_id=audio_record_id,
            text=transcription_result["text"],
            confidence=transcription_result.get("confidence"),
            language=transcription_result.get("language", "zh-CN")
        )
        db.add(transcription)
        
        # 更新音频记录状态
        if record:
            record.status = "completed"
        
        db.commit()
        
    except Exception as e:
        # 更新状态为失败
        record = db.query(AudioRecord).filter(
            AudioRecord.id == audio_record_id
        ).first()
        
        if record:
            record.status = "failed"
            db.commit()
        
        print(f"音频转写失败：{str(e)}")
        
    finally:
        db.close()
