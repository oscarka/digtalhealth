"""
健康报告路由
生成和管理健康报告
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import HealthReport, PersonalizedPlan, UserFeedback, User
from app.schemas import (
    HealthReportCreate, HealthReportResponse, APIResponse, PaginationParams
)
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

@router.post("/generate", response_model=APIResponse)
async def generate_health_report(
    report_data: HealthReportCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    生成健康报告
    """
    try:
        # 验证用户和方案
        user = db.query(User).filter(User.id == report_data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        plan = db.query(PersonalizedPlan).filter(
            PersonalizedPlan.id == report_data.plan_id,
            PersonalizedPlan.user_id == report_data.user_id
        ).first()
        
        if not plan:
            raise HTTPException(status_code=404, detail="个性化方案不存在")
        
        # 创建报告记录
        health_report = HealthReport(
            user_id=report_data.user_id,
            plan_id=report_data.plan_id,
            report_type=report_data.report_type,
            report_data=report_data.report_data,
            objective_metrics=report_data.objective_metrics,
            subjective_improvements=report_data.subjective_improvements,
            behavior_transformations=report_data.behavior_transformations,
            visualization_data=report_data.visualization_data
        )
        db.add(health_report)
        db.commit()
        db.refresh(health_report)
        
        # 后台生成详细报告
        background_tasks.add_task(
            generate_detailed_report_background,
            health_report.id,
            report_data.user_id,
            report_data.plan_id
        )
        
        return APIResponse(
            message="健康报告生成已开始",
            data={
                "report_id": health_report.id,
                "report_type": health_report.report_type,
                "status": "processing"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成报告失败：{str(e)}")

@router.get("/user/{user_id}", response_model=APIResponse)
async def get_user_reports(
    user_id: int,
    page: int = 1,
    size: int = 20,
    report_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取用户的健康报告列表
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 构建查询
        query = db.query(HealthReport).filter(HealthReport.user_id == user_id)
        
        if report_type:
            query = query.filter(HealthReport.report_type == report_type)
        
        # 分页查询
        offset = (page - 1) * size
        reports = query.order_by(HealthReport.created_at.desc()).offset(offset).limit(size).all()
        
        total = query.count()
        
        return APIResponse(
            message="获取健康报告列表成功",
            data={
                "reports": [
                    {
                        "report_id": report.id,
                        "plan_id": report.plan_id,
                        "report_type": report.report_type,
                        "created_at": report.created_at.isoformat(),
                        "summary": {
                            "objective_metrics_count": len(report.objective_metrics or {}),
                            "subjective_improvements_count": len(report.subjective_improvements or {}),
                            "behavior_transformations_count": len(report.behavior_transformations or {})
                        }
                    }
                    for report in reports
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
        raise HTTPException(status_code=500, detail=f"获取报告列表失败：{str(e)}")

@router.get("/detail/{report_id}", response_model=APIResponse)
async def get_report_detail(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    获取健康报告详情
    """
    try:
        report = db.query(HealthReport).filter(
            HealthReport.id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="健康报告不存在")
        
        return APIResponse(
            message="获取健康报告详情成功",
            data={
                "report_id": report.id,
                "user_id": report.user_id,
                "plan_id": report.plan_id,
                "report_type": report.report_type,
                "report_data": report.report_data,
                "objective_metrics": report.objective_metrics,
                "subjective_improvements": report.subjective_improvements,
                "behavior_transformations": report.behavior_transformations,
                "visualization_data": report.visualization_data,
                "created_at": report.created_at.isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取报告详情失败：{str(e)}")

@router.post("/periodic/{plan_id}", response_model=APIResponse)
async def generate_periodic_report(
    plan_id: int,
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    生成定期反馈报告
    """
    try:
        # 验证方案
        plan = db.query(PersonalizedPlan).filter(
            PersonalizedPlan.id == plan_id,
            PersonalizedPlan.user_id == user_id
        ).first()
        
        if not plan:
            raise HTTPException(status_code=404, detail="个性化方案不存在")
        
        # 获取用户反馈历史
        feedback_history = db.query(UserFeedback).filter(
            UserFeedback.plan_id == plan_id
        ).order_by(UserFeedback.created_at.desc()).limit(10).all()
        
        if not feedback_history:
            raise HTTPException(status_code=400, detail="没有足够的反馈数据生成报告")
        
        # 准备反馈数据
        feedback_data = [
            {
                "type": fb.feedback_type,
                "data": fb.feedback_data,
                "health_metrics": fb.health_metrics,
                "subjective_feelings": fb.subjective_feelings,
                "behavior_changes": fb.behavior_changes,
                "created_at": fb.created_at.isoformat()
            }
            for fb in feedback_history
        ]
        
        # 使用AI服务生成报告
        health_report_data = await ai_service.generate_health_report(
            plan.plan_data, feedback_data
        )
        
        # 创建报告记录
        health_report = HealthReport(
            user_id=user_id,
            plan_id=plan_id,
            report_type="periodic",
            report_data=health_report_data,
            objective_metrics=health_report_data.get("objective_metrics", {}),
            subjective_improvements=health_report_data.get("subjective_improvements", {}),
            behavior_transformations=health_report_data.get("behavior_transformations", {}),
            visualization_data=health_report_data.get("visualization_data", {})
        )
        db.add(health_report)
        db.commit()
        db.refresh(health_report)
        
        return APIResponse(
            message="定期反馈报告生成成功",
            data={
                "report_id": health_report.id,
                "report_type": "periodic",
                "feedback_count": len(feedback_history),
                "report_summary": health_report_data.get("summary", ""),
                "created_at": health_report.created_at.isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成定期报告失败：{str(e)}")

@router.get("/trends/{user_id}", response_model=APIResponse)
async def get_health_trends(
    user_id: int,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    获取健康趋势分析
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 获取指定天数内的报告
        from datetime import datetime, timedelta
        start_date = datetime.now() - timedelta(days=days)
        
        reports = db.query(HealthReport).filter(
            HealthReport.user_id == user_id,
            HealthReport.created_at >= start_date
        ).order_by(HealthReport.created_at.asc()).all()
        
        if not reports:
            raise HTTPException(status_code=404, detail="指定时间段内没有报告数据")
        
        # 分析趋势
        trends = analyze_health_trends(reports)
        
        return APIResponse(
            message="获取健康趋势成功",
            data={
                "user_id": user_id,
                "analysis_period": f"最近{days}天",
                "reports_count": len(reports),
                "trends": trends,
                "summary": generate_trend_summary(trends)
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取健康趋势失败：{str(e)}")

@router.delete("/delete/{report_id}", response_model=APIResponse)
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    删除健康报告
    """
    try:
        report = db.query(HealthReport).filter(
            HealthReport.id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="健康报告不存在")
        
        db.delete(report)
        db.commit()
        
        return APIResponse(message="健康报告删除成功")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除报告失败：{str(e)}")

def analyze_health_trends(reports: List[HealthReport]) -> dict:
    """分析健康趋势"""
    trends = {
        "objective_metrics": {},
        "subjective_improvements": {},
        "behavior_transformations": {},
        "overall_trend": "improving"  # improving, stable, declining
    }
    
    # 分析客观指标趋势
    for report in reports:
        if report.objective_metrics:
            for metric, value in report.objective_metrics.items():
                if metric not in trends["objective_metrics"]:
                    trends["objective_metrics"][metric] = []
                trends["objective_metrics"][metric].append({
                    "value": value,
                    "date": report.created_at.isoformat()
                })
    
    # 分析主观改善趋势
    for report in reports:
        if report.subjective_improvements:
            for improvement, level in report.subjective_improvements.items():
                if improvement not in trends["subjective_improvements"]:
                    trends["subjective_improvements"][improvement] = []
                trends["subjective_improvements"][improvement].append({
                    "level": level,
                    "date": report.created_at.isoformat()
                })
    
    # 分析行为转变趋势
    for report in reports:
        if report.behavior_transformations:
            for behavior, change in report.behavior_transformations.items():
                if behavior not in trends["behavior_transformations"]:
                    trends["behavior_transformations"][behavior] = []
                trends["behavior_transformations"][behavior].append({
                    "change": change,
                    "date": report.created_at.isoformat()
                })
    
    return trends

def generate_trend_summary(trends: dict) -> str:
    """生成趋势摘要"""
    summary_parts = []
    
    # 客观指标摘要
    if trends["objective_metrics"]:
        summary_parts.append(f"监测到{len(trends['objective_metrics'])}项客观指标变化")
    
    # 主观改善摘要
    if trends["subjective_improvements"]:
        summary_parts.append(f"记录到{len(trends['subjective_improvements'])}项主观感受改善")
    
    # 行为转变摘要
    if trends["behavior_transformations"]:
        summary_parts.append(f"观察到{len(trends['behavior_transformations'])}项行为习惯转变")
    
    return "；".join(summary_parts) if summary_parts else "暂无趋势数据"

async def generate_detailed_report_background(report_id: int, user_id: int, plan_id: int):
    """后台生成详细报告"""
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # 获取报告
        report = db.query(HealthReport).filter(
            HealthReport.id == report_id
        ).first()
        
        if not report:
            return
        
        # 获取方案和反馈数据
        plan = db.query(PersonalizedPlan).filter(
            PersonalizedPlan.id == plan_id
        ).first()
        
        feedback_history = db.query(UserFeedback).filter(
            UserFeedback.plan_id == plan_id
        ).order_by(UserFeedback.created_at.desc()).limit(10).all()
        
        # 准备数据
        feedback_data = [
            {
                "type": fb.feedback_type,
                "data": fb.feedback_data,
                "health_metrics": fb.health_metrics,
                "subjective_feelings": fb.subjective_feelings,
                "behavior_changes": fb.behavior_changes,
                "created_at": fb.created_at.isoformat()
            }
            for fb in feedback_history
        ]
        
        # 生成详细报告
        detailed_report = await ai_service.generate_health_report(
            plan.plan_data if plan else {}, feedback_data
        )
        
        # 更新报告
        report.report_data = detailed_report
        report.objective_metrics = detailed_report.get("objective_metrics", {})
        report.subjective_improvements = detailed_report.get("subjective_improvements", {})
        report.behavior_transformations = detailed_report.get("behavior_transformations", {})
        report.visualization_data = detailed_report.get("visualization_data", {})
        
        db.commit()
        
    except Exception as e:
        print(f"后台生成详细报告失败：{str(e)}")
        
    finally:
        db.close()
