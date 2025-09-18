"""
健康简历路由
管理用户的健康简历信息
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import HealthProfile, User
from app.schemas import (
    HealthProfileCreate, HealthProfileUpdate, HealthProfileResponse, 
    APIResponse, PaginationParams
)

router = APIRouter()

@router.post("/create", response_model=APIResponse)
async def create_health_profile(
    profile_data: HealthProfileCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    创建健康简历
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 检查是否已有健康简历
        existing_profile = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).first()
        
        if existing_profile:
            raise HTTPException(status_code=400, detail="用户已有健康简历，请使用更新接口")
        
        # 创建健康简历
        health_profile = HealthProfile(
            user_id=user_id,
            profile_data=profile_data.profile_data,
            narrative=profile_data.narrative,
            version=1
        )
        db.add(health_profile)
        db.commit()
        db.refresh(health_profile)
        
        return APIResponse(
            message="健康简历创建成功",
            data={
                "profile_id": health_profile.id,
                "version": health_profile.version,
                "created_at": health_profile.created_at.isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建失败：{str(e)}")

@router.get("/user/{user_id}", response_model=APIResponse)
async def get_user_health_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    获取用户的健康简历
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 获取健康简历
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).order_by(HealthProfile.version.desc()).first()
        
        if not health_profile:
            raise HTTPException(status_code=404, detail="健康简历不存在")
        
        return APIResponse(
            message="获取健康简历成功",
            data={
                "profile_id": health_profile.id,
                "user_id": health_profile.user_id,
                "profile_data": health_profile.profile_data,
                "narrative": health_profile.narrative,
                "version": health_profile.version,
                "created_at": health_profile.created_at.isoformat(),
                "updated_at": health_profile.updated_at.isoformat() if health_profile.updated_at else None
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取失败：{str(e)}")

@router.put("/update/{profile_id}", response_model=APIResponse)
async def update_health_profile(
    profile_id: int,
    update_data: HealthProfileUpdate,
    db: Session = Depends(get_db)
):
    """
    更新健康简历
    """
    try:
        # 获取现有健康简历
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.id == profile_id
        ).first()
        
        if not health_profile:
            raise HTTPException(status_code=404, detail="健康简历不存在")
        
        # 更新数据
        if update_data.profile_data is not None:
            health_profile.profile_data = update_data.profile_data
        
        if update_data.narrative is not None:
            health_profile.narrative = update_data.narrative
        
        # 增加版本号
        health_profile.version += 1
        
        db.commit()
        db.refresh(health_profile)
        
        return APIResponse(
            message="健康简历更新成功",
            data={
                "profile_id": health_profile.id,
                "version": health_profile.version,
                "updated_at": health_profile.updated_at.isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新失败：{str(e)}")

@router.get("/history/{user_id}", response_model=APIResponse)
async def get_health_profile_history(
    user_id: int,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db)
):
    """
    获取健康简历历史版本
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 分页查询历史版本
        offset = (page - 1) * size
        profiles = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).order_by(HealthProfile.version.desc()).offset(offset).limit(size).all()
        
        total = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).count()
        
        return APIResponse(
            message="获取健康简历历史成功",
            data={
                "profiles": [
                    {
                        "profile_id": profile.id,
                        "version": profile.version,
                        "created_at": profile.created_at.isoformat(),
                        "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
                        "summary": {
                            "basic_info": profile.profile_data.get("basic_info", {}),
                            "symptoms_count": len(profile.profile_data.get("symptoms", [])),
                            "background_info": bool(profile.profile_data.get("background", {}))
                        }
                    }
                    for profile in profiles
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
        raise HTTPException(status_code=500, detail=f"获取历史失败：{str(e)}")

@router.get("/version/{profile_id}/{version}", response_model=APIResponse)
async def get_health_profile_version(
    profile_id: int,
    version: int,
    db: Session = Depends(get_db)
):
    """
    获取指定版本的健康简历
    """
    try:
        # 获取指定版本的健康简历
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.id == profile_id,
            HealthProfile.version == version
        ).first()
        
        if not health_profile:
            raise HTTPException(status_code=404, detail="指定版本的健康简历不存在")
        
        return APIResponse(
            message="获取健康简历版本成功",
            data={
                "profile_id": health_profile.id,
                "user_id": health_profile.user_id,
                "version": health_profile.version,
                "profile_data": health_profile.profile_data,
                "narrative": health_profile.narrative,
                "created_at": health_profile.created_at.isoformat(),
                "updated_at": health_profile.updated_at.isoformat() if health_profile.updated_at else None
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取版本失败：{str(e)}")

@router.delete("/delete/{profile_id}", response_model=APIResponse)
async def delete_health_profile(
    profile_id: int,
    db: Session = Depends(get_db)
):
    """
    删除健康简历
    """
    try:
        # 获取健康简历
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.id == profile_id
        ).first()
        
        if not health_profile:
            raise HTTPException(status_code=404, detail="健康简历不存在")
        
        # 删除健康简历
        db.delete(health_profile)
        db.commit()
        
        return APIResponse(message="健康简历删除成功")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败：{str(e)}")

@router.post("/merge/{user_id}", response_model=APIResponse)
async def merge_health_profiles(
    user_id: int,
    source_profile_ids: list,
    db: Session = Depends(get_db)
):
    """
    合并多个健康简历
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 获取源健康简历
        source_profiles = db.query(HealthProfile).filter(
            HealthProfile.id.in_(source_profile_ids),
            HealthProfile.user_id == user_id
        ).all()
        
        if len(source_profiles) < 2:
            raise HTTPException(status_code=400, detail="至少需要两个健康简历才能合并")
        
        # 合并数据
        merged_data = {}
        merged_narrative = ""
        
        for profile in source_profiles:
            # 合并profile_data
            for key, value in profile.profile_data.items():
                if key not in merged_data:
                    merged_data[key] = value
                elif isinstance(value, list) and isinstance(merged_data[key], list):
                    merged_data[key].extend(value)
                elif isinstance(value, dict) and isinstance(merged_data[key], dict):
                    merged_data[key].update(value)
            
            # 合并narrative
            if profile.narrative:
                merged_narrative += f"版本{profile.version}：{profile.narrative}\n\n"
        
        # 创建新的合并健康简历
        merged_profile = HealthProfile(
            user_id=user_id,
            profile_data=merged_data,
            narrative=merged_narrative.strip(),
            version=1
        )
        db.add(merged_profile)
        db.commit()
        db.refresh(merged_profile)
        
        return APIResponse(
            message="健康简历合并成功",
            data={
                "merged_profile_id": merged_profile.id,
                "source_profiles_count": len(source_profiles),
                "version": merged_profile.version
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"合并失败：{str(e)}")
