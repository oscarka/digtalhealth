"""
健康简历相关API路由
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from app.database import get_db
from app.models import User, AudioRecord, HealthProfile, HealthAnalysis
# from app.schemas import HealthResumeCreate, HealthResumeUpdate, HealthResumeResponse
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

@router.post("/upload-audio")
async def upload_audio_for_resume(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    上传音频文件并开始生成健康简历
    """
    try:
        # 保存音频文件
        audio_record = AudioRecord(
            user_id=user_id,
            filename=file.filename,
            file_path=f"uploads/{file.filename}",
            file_size=file.size,
            duration=0,  # 需要计算
            format=file.filename.split('.')[-1],
            status="uploaded"
        )
        db.add(audio_record)
        db.commit()
        db.refresh(audio_record)
        
        # 开始AI分析
        analysis_result = await ai_service.generate_health_resume(audio_record.id)
        
        return {
            "audio_id": audio_record.id,
            "status": "uploaded",
            "analysis_started": True,
            "message": "音频上传成功，开始生成健康简历"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

@router.get("/resume/{user_id}")
async def get_health_resume(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    获取用户的健康简历
    """
    try:
        # 获取用户信息
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 获取健康简历
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).order_by(HealthProfile.created_at.desc()).first()
        
        if not health_profile:
            return {
                "user_id": user_id,
                "has_resume": False,
                "message": "尚未生成健康简历"
            }
        
        # 解析健康简历数据
        resume_data = health_profile.profile_data
        
        return {
            "user_id": user_id,
            "has_resume": True,
            "resume": resume_data,
            "last_updated": health_profile.updated_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取健康简历失败: {str(e)}")

@router.post("/resume/{user_id}/add-event")
async def add_health_event(
    user_id: int,
    theme: str = Form(...),
    year: str = Form(...),
    event: str = Form(...),
    details: str = Form(...),
    event_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    添加新的健康事件到简历中
    """
    try:
        # 获取现有健康简历
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).order_by(HealthProfile.created_at.desc()).first()
        
        if not health_profile:
            raise HTTPException(status_code=404, detail="健康简历不存在")
        
        # 更新简历数据
        resume_data = health_profile.profile_data
        
        # 添加新事件到对应主题
        if theme not in resume_data.get("themes", {}):
            resume_data["themes"][theme] = {
                "title": theme,
                "timeline": [],
                "interventions": []
            }
        
        new_event = {
            "year": year,
            "event": event,
            "details": details,
            "type": event_type,
            "added_at": datetime.now().isoformat()
        }
        
        resume_data["themes"][theme]["timeline"].append(new_event)
        
        # 更新版本
        resume_data["version"] = resume_data.get("version", 0) + 1
        resume_data["last_updated"] = datetime.now().isoformat()
        
        # 保存更新
        health_profile.profile_data = resume_data
        health_profile.version = resume_data["version"]
        health_profile.updated_at = datetime.now()
        
        db.commit()
        
        return {
            "success": True,
            "message": "事件添加成功",
            "new_version": resume_data["version"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加事件失败: {str(e)}")

@router.get("/resume/{user_id}/themes")
async def get_resume_themes(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    获取健康简历的所有主题
    """
    try:
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).order_by(HealthProfile.created_at.desc()).first()
        
        if not health_profile:
            return {"themes": []}
        
        resume_data = health_profile.profile_data
        themes = resume_data.get("themes", {})
        
        return {
            "themes": list(themes.keys()),
            "theme_details": themes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取主题失败: {str(e)}")

@router.get("/resume/{user_id}/timeline/{theme}")
async def get_theme_timeline(
    user_id: int,
    theme: str,
    db: Session = Depends(get_db)
):
    """
    获取特定主题的时间线
    """
    try:
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).order_by(HealthProfile.created_at.desc()).first()
        
        if not health_profile:
            raise HTTPException(status_code=404, detail="健康简历不存在")
        
        resume_data = health_profile.profile_data
        themes = resume_data.get("themes", {})
        
        if theme not in themes:
            raise HTTPException(status_code=404, detail="主题不存在")
        
        return {
            "theme": theme,
            "timeline": themes[theme].get("timeline", []),
            "overview": themes[theme].get("overview", ""),
            "interventions": themes[theme].get("interventions", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间线失败: {str(e)}")

@router.post("/resume/{user_id}/analyze")
async def analyze_health_resume(
    user_id: int,
    analysis_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    对健康简历进行深度分析
    """
    try:
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).order_by(HealthProfile.created_at.desc()).first()
        
        if not health_profile:
            raise HTTPException(status_code=404, detail="健康简历不存在")
        
        # 调用AI服务进行深度分析
        analysis_result = await ai_service.analyze_health_resume(
            health_profile.profile_data, 
            analysis_type
        )
        
        return {
            "analysis_type": analysis_type,
            "result": analysis_result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")
