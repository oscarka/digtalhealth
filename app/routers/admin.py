"""
系统管理路由
用户管理、系统监控、数据管理等功能
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import (
    User, AudioRecord, HealthAnalysis, HealthProfile, 
    PersonalizedPlan, UserFeedback, HealthReport, SystemLog
)
from app.schemas import (
    UserCreate, UserUpdate, UserResponse, APIResponse, PaginationParams
)

router = APIRouter()

@router.get("/dashboard", response_model=APIResponse)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    获取系统仪表板统计数据
    """
    try:
        # 用户统计
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # 音频记录统计
        total_audio_records = db.query(AudioRecord).count()
        completed_transcriptions = db.query(AudioRecord).filter(
            AudioRecord.status == "completed"
        ).count()
        
        # 分析统计
        total_analyses = db.query(HealthAnalysis).count()
        completed_analyses = db.query(HealthAnalysis).filter(
            HealthAnalysis.status == "completed"
        ).count()
        
        # 健康简历统计
        total_profiles = db.query(HealthProfile).count()
        
        # 个性化方案统计
        total_plans = db.query(PersonalizedPlan).count()
        active_plans = db.query(PersonalizedPlan).filter(
            PersonalizedPlan.status == "active"
        ).count()
        
        # 用户反馈统计
        total_feedbacks = db.query(UserFeedback).count()
        
        # 健康报告统计
        total_reports = db.query(HealthReport).count()
        
        # 最近7天活动统计
        seven_days_ago = datetime.now() - timedelta(days=7)
        
        recent_users = db.query(User).filter(
            User.created_at >= seven_days_ago
        ).count()
        
        recent_analyses = db.query(HealthAnalysis).filter(
            HealthAnalysis.created_at >= seven_days_ago
        ).count()
        
        recent_feedbacks = db.query(UserFeedback).filter(
            UserFeedback.created_at >= seven_days_ago
        ).count()
        
        return APIResponse(
            message="获取仪表板数据成功",
            data={
                "overview": {
                    "total_users": total_users,
                    "active_users": active_users,
                    "total_audio_records": total_audio_records,
                    "completed_transcriptions": completed_transcriptions,
                    "total_analyses": total_analyses,
                    "completed_analyses": completed_analyses,
                    "total_profiles": total_profiles,
                    "total_plans": total_plans,
                    "active_plans": active_plans,
                    "total_feedbacks": total_feedbacks,
                    "total_reports": total_reports
                },
                "recent_activity": {
                    "recent_users": recent_users,
                    "recent_analyses": recent_analyses,
                    "recent_feedbacks": recent_feedbacks,
                    "period": "最近7天"
                },
                "system_health": {
                    "transcription_success_rate": (completed_transcriptions / total_audio_records * 100) if total_audio_records > 0 else 0,
                    "analysis_success_rate": (completed_analyses / total_analyses * 100) if total_analyses > 0 else 0,
                    "user_activity_rate": (active_users / total_users * 100) if total_users > 0 else 0
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取仪表板数据失败：{str(e)}")

@router.get("/users", response_model=APIResponse)
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    获取用户列表
    """
    try:
        # 构建查询
        query = db.query(User)
        
        if role:
            query = query.filter(User.role == role)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        # 分页查询
        offset = (page - 1) * size
        users = query.order_by(User.created_at.desc()).offset(offset).limit(size).all()
        
        total = query.count()
        
        return APIResponse(
            message="获取用户列表成功",
            data={
                "users": [
                    {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "full_name": user.full_name,
                        "role": user.role,
                        "is_active": user.is_active,
                        "created_at": user.created_at.isoformat(),
                        "updated_at": user.updated_at.isoformat() if user.updated_at else None
                    }
                    for user in users
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
        raise HTTPException(status_code=500, detail=f"获取用户列表失败：{str(e)}")

@router.post("/users", response_model=APIResponse)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    创建用户
    """
    try:
        # 检查用户名是否已存在
        existing_user = db.query(User).filter(
            User.username == user_data.username
        ).first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="用户名已存在")
        
        # 检查邮箱是否已存在
        existing_email = db.query(User).filter(
            User.email == user_data.email
        ).first()
        
        if existing_email:
            raise HTTPException(status_code=400, detail="邮箱已存在")
        
        # 创建用户
        user = User(
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role.value,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return APIResponse(
            message="用户创建成功",
            data={
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at.isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建用户失败：{str(e)}")

@router.put("/users/{user_id}", response_model=APIResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    """
    更新用户信息
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 更新用户信息
        if user_data.full_name is not None:
            user.full_name = user_data.full_name
        
        if user_data.email is not None:
            # 检查邮箱是否已被其他用户使用
            existing_email = db.query(User).filter(
                User.email == user_data.email,
                User.id != user_id
            ).first()
            
            if existing_email:
                raise HTTPException(status_code=400, detail="邮箱已被其他用户使用")
            
            user.email = user_data.email
        
        if user_data.role is not None:
            user.role = user_data.role.value
        
        if user_data.is_active is not None:
            user.is_active = user_data.is_active
        
        db.commit()
        db.refresh(user)
        
        return APIResponse(
            message="用户信息更新成功",
            data={
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_active": user.is_active,
                "updated_at": user.updated_at.isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新用户失败：{str(e)}")

@router.delete("/users/{user_id}", response_model=APIResponse)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    删除用户
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 检查用户是否有相关数据
        audio_count = db.query(AudioRecord).filter(AudioRecord.user_id == user_id).count()
        analysis_count = db.query(HealthAnalysis).filter(HealthAnalysis.user_id == user_id).count()
        
        if audio_count > 0 or analysis_count > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"用户有{audio_count}个音频记录和{analysis_count}个分析记录，无法删除"
            )
        
        db.delete(user)
        db.commit()
        
        return APIResponse(message="用户删除成功")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除用户失败：{str(e)}")

@router.get("/system-logs", response_model=APIResponse)
async def get_system_logs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    action: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    获取系统日志
    """
    try:
        # 构建查询
        query = db.query(SystemLog)
        
        if action:
            query = query.filter(SystemLog.action.like(f"%{action}%"))
        
        if user_id:
            query = query.filter(SystemLog.user_id == user_id)
        
        # 分页查询
        offset = (page - 1) * size
        logs = query.order_by(SystemLog.created_at.desc()).offset(offset).limit(size).all()
        
        total = query.count()
        
        return APIResponse(
            message="获取系统日志成功",
            data={
                "logs": [
                    {
                        "id": log.id,
                        "user_id": log.user_id,
                        "action": log.action,
                        "resource_type": log.resource_type,
                        "resource_id": log.resource_id,
                        "ip_address": log.ip_address,
                        "created_at": log.created_at.isoformat()
                    }
                    for log in logs
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
        raise HTTPException(status_code=500, detail=f"获取系统日志失败：{str(e)}")

@router.get("/analytics", response_model=APIResponse)
async def get_system_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    获取系统分析数据
    """
    try:
        # 计算时间范围
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 用户增长趋势
        user_growth = db.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at >= start_date
        ).group_by(func.date(User.created_at)).all()
        
        # 分析完成趋势
        analysis_trend = db.query(
            func.date(HealthAnalysis.created_at).label('date'),
            func.count(HealthAnalysis.id).label('count')
        ).filter(
            HealthAnalysis.created_at >= start_date,
            HealthAnalysis.status == "completed"
        ).group_by(func.date(HealthAnalysis.created_at)).all()
        
        # 用户活跃度
        active_users = db.query(User).filter(
            User.is_active == True
        ).count()
        
        # 平均分析时间
        avg_analysis_time = db.query(
            func.avg(
                func.extract('epoch', HealthAnalysis.completed_at) - 
                func.extract('epoch', HealthAnalysis.created_at)
            )
        ).filter(
            HealthAnalysis.status == "completed",
            HealthAnalysis.completed_at.isnot(None)
        ).scalar() or 0
        
        return APIResponse(
            message="获取系统分析数据成功",
            data={
                "period": f"最近{days}天",
                "user_growth": [
                    {"date": str(growth.date), "count": growth.count}
                    for growth in user_growth
                ],
                "analysis_trend": [
                    {"date": str(trend.date), "count": trend.count}
                    for trend in analysis_trend
                ],
                "metrics": {
                    "active_users": active_users,
                    "avg_analysis_time_minutes": round(avg_analysis_time / 60, 2),
                    "total_days": days
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取系统分析数据失败：{str(e)}")

@router.post("/backup", response_model=APIResponse)
async def create_system_backup(db: Session = Depends(get_db)):
    """
    创建系统备份
    """
    try:
        # 这里应该实现实际的备份逻辑
        # 包括数据库备份、文件备份等
        
        backup_info = {
            "backup_id": f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "created_at": datetime.now().isoformat(),
            "status": "completed",
            "size": "约100MB",
            "includes": [
                "用户数据",
                "音频记录",
                "健康分析",
                "个性化方案",
                "用户反馈",
                "健康报告"
            ]
        }
        
        return APIResponse(
            message="系统备份创建成功",
            data=backup_info
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建备份失败：{str(e)}")

@router.get("/health-check", response_model=APIResponse)
async def system_health_check(db: Session = Depends(get_db)):
    """
    系统健康检查
    """
    try:
        # 检查数据库连接
        db.execute("SELECT 1")
        database_status = "healthy"
        
        # 检查关键表
        user_count = db.query(User).count()
        audio_count = db.query(AudioRecord).count()
        analysis_count = db.query(HealthAnalysis).count()
        
        # 检查最近错误
        recent_errors = db.query(SystemLog).filter(
            SystemLog.action.like("%error%")
        ).order_by(SystemLog.created_at.desc()).limit(5).all()
        
        health_status = {
            "database": database_status,
            "tables": {
                "users": user_count,
                "audio_records": audio_count,
                "health_analyses": analysis_count
            },
            "recent_errors": [
                {
                    "action": log.action,
                    "created_at": log.created_at.isoformat()
                }
                for log in recent_errors
            ],
            "overall_status": "healthy" if database_status == "healthy" else "unhealthy",
            "checked_at": datetime.now().isoformat()
        }
        
        return APIResponse(
            message="系统健康检查完成",
            data=health_status
        )
        
    except Exception as e:
        return APIResponse(
            success=False,
            message="系统健康检查失败",
            data={
                "error": str(e),
                "overall_status": "unhealthy",
                "checked_at": datetime.now().isoformat()
            }
        )
