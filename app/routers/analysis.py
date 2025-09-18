"""
健康分析路由
处理九阶段健康需求分析
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import AudioRecord, HealthAnalysis, User
from app.schemas import APIResponse, HealthAnalysisResponse
from app.services.analysis_service import AnalysisService
from app.services.ai_service import AIService

router = APIRouter()
analysis_service = AnalysisService()
ai_service = AIService()

@router.post("/start/{audio_record_id}", response_model=APIResponse)
async def start_health_analysis(
    audio_record_id: int,
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    开始健康需求分析
    启动完整的九阶段分析流程
    """
    try:
        # 验证音频记录
        audio_record = db.query(AudioRecord).filter(
            AudioRecord.id == audio_record_id,
            AudioRecord.user_id == user_id
        ).first()
        
        if not audio_record:
            raise HTTPException(status_code=404, detail="音频记录不存在")
        
        if audio_record.status != "completed":
            raise HTTPException(status_code=400, detail="音频转写未完成，无法开始分析")
        
        # 检查是否已有分析记录
        existing_analysis = db.query(HealthAnalysis).filter(
            HealthAnalysis.audio_record_id == audio_record_id,
            HealthAnalysis.user_id == user_id
        ).first()
        
        if existing_analysis:
            return APIResponse(
                message="分析已完成",
                data={
                    "analysis_id": existing_analysis.id,
                    "status": existing_analysis.status,
                    "stages_completed": 9 if existing_analysis.status == "completed" else 0
                }
            )
        
        # 创建分析记录
        analysis = HealthAnalysis(
            audio_record_id=audio_record_id,
            user_id=user_id,
            stage=0,
            stage_name="分析开始",
            analysis_data={},
            status="processing"
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # 后台执行分析
        background_tasks.add_task(
            run_analysis_background,
            analysis.id,
            audio_record_id,
            user_id
        )
        
        return APIResponse(
            message="健康需求分析已开始",
            data={
                "analysis_id": analysis.id,
                "status": "processing",
                "estimated_time": "5分钟"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"启动分析失败：{str(e)}")

@router.get("/status/{analysis_id}", response_model=APIResponse)
async def get_analysis_status(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """
    获取分析状态
    """
    try:
        analysis = db.query(HealthAnalysis).filter(
            HealthAnalysis.id == analysis_id
        ).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="分析记录不存在")
        
        return APIResponse(
            message="获取分析状态成功",
            data={
                "analysis_id": analysis.id,
                "status": analysis.status,
                "stage": analysis.stage,
                "stage_name": analysis.stage_name,
                "confidence_score": analysis.confidence_score,
                "created_at": analysis.created_at.isoformat(),
                "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取状态失败：{str(e)}")

@router.get("/result/{analysis_id}", response_model=APIResponse)
async def get_analysis_result(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """
    获取分析结果
    """
    try:
        analysis = db.query(HealthAnalysis).filter(
            HealthAnalysis.id == analysis_id
        ).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="分析记录不存在")
        
        if analysis.status != "completed":
            raise HTTPException(status_code=400, detail="分析尚未完成")
        
        return APIResponse(
            message="获取分析结果成功",
            data={
                "analysis_id": analysis.id,
                "analysis_data": analysis.analysis_data,
                "confidence_score": analysis.confidence_score,
                "completed_at": analysis.completed_at.isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取结果失败：{str(e)}")

@router.get("/user/{user_id}", response_model=APIResponse)
async def get_user_analyses(
    user_id: int,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db)
):
    """
    获取用户的分析历史
    """
    try:
        # 验证用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 分页查询
        offset = (page - 1) * size
        analyses = db.query(HealthAnalysis).filter(
            HealthAnalysis.user_id == user_id
        ).offset(offset).limit(size).all()
        
        total = db.query(HealthAnalysis).filter(
            HealthAnalysis.user_id == user_id
        ).count()
        
        return APIResponse(
            message="获取分析历史成功",
            data={
                "analyses": [
                    {
                        "id": analysis.id,
                        "audio_record_id": analysis.audio_record_id,
                        "stage": analysis.stage,
                        "stage_name": analysis.stage_name,
                        "status": analysis.status,
                        "confidence_score": analysis.confidence_score,
                        "created_at": analysis.created_at.isoformat(),
                        "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None
                    }
                    for analysis in analyses
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
        raise HTTPException(status_code=500, detail=f"获取分析历史失败：{str(e)}")

@router.post("/stage/{analysis_id}/{stage}", response_model=APIResponse)
async def run_single_stage_analysis(
    analysis_id: int,
    stage: int,
    db: Session = Depends(get_db)
):
    """
    运行单个阶段的分析
    """
    try:
        if stage < 1 or stage > 9:
            raise HTTPException(status_code=400, detail="阶段编号必须在1-9之间")
        
        analysis = db.query(HealthAnalysis).filter(
            HealthAnalysis.id == analysis_id
        ).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="分析记录不存在")
        
        # 根据阶段执行相应的分析
        stage_result = await run_single_stage(analysis, stage, db)
        
        # 更新分析记录
        analysis.analysis_data.update({f"stage{stage}": stage_result})
        analysis.stage = stage
        analysis.stage_name = get_stage_name(stage)
        db.commit()
        
        return APIResponse(
            message=f"第{stage}阶段分析完成",
            data={
                "stage": stage,
                "stage_name": get_stage_name(stage),
                "result": stage_result
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"阶段分析失败：{str(e)}")

async def run_single_stage(analysis: HealthAnalysis, stage: int, db: Session):
    """运行单个阶段分析"""
    # 获取转写文本
    from app.models import Transcription
    transcription = db.query(Transcription).filter(
        Transcription.audio_record_id == analysis.audio_record_id
    ).first()
    
    if not transcription:
        raise Exception("转写文本不存在")
    
    if stage == 1:
        # 第一阶段：信息提取
        return await ai_service.extract_core_information(transcription.text)
    elif stage == 2:
        # 第二阶段：多维评估
        core_info = analysis.analysis_data.get("stage1", {})
        return await ai_service.multi_dimensional_assessment(core_info)
    elif stage == 3:
        # 第三阶段：需求验证
        requirements = analysis.analysis_data.get("stage2", {})
        return await ai_service.validate_requirements(requirements)
    elif stage == 4:
        # 第四阶段：模块创建
        validated_reqs = analysis.analysis_data.get("stage3", {})
        return await ai_service.create_solution_modules(validated_reqs)
    elif stage == 5:
        # 第五阶段：模块排序
        modules = analysis.analysis_data.get("stage4", {})
        return await ai_service.rank_modules(modules)
    elif stage == 6:
        # 第六阶段：树形方案
        ranked_modules = analysis.analysis_data.get("stage5", {}).get("ranked_modules", [])
        solution_trees = []
        for module in ranked_modules:
            tree_result = await ai_service.create_solution_tree(module)
            solution_trees.append(tree_result)
        return {"solution_trees": solution_trees}
    elif stage == 7:
        # 第七阶段：个性化方案
        solution_trees = analysis.analysis_data.get("stage6", {}).get("solution_trees", [])
        customer_preferences = {"budget": "中等", "convenience": "高"}
        return await ai_service.create_personalized_plan(solution_trees, customer_preferences)
    elif stage == 8:
        # 第八阶段：动态调整（需要反馈数据）
        return {"message": "需要用户反馈数据才能进行动态调整"}
    elif stage == 9:
        # 第九阶段：报告生成（需要历史数据）
        return {"message": "需要历史数据才能生成报告"}
    else:
        raise Exception(f"无效的阶段编号：{stage}")

def get_stage_name(stage: int) -> str:
    """获取阶段名称"""
    stage_names = {
        1: "多源数据采集与解析",
        2: "多维健康需求评估",
        3: "需求分析结果验证",
        4: "整合需求形成框架",
        5: "框架排序",
        6: "树形方案构建",
        7: "个性化方案",
        8: "动态调整",
        9: "定期反馈报告"
    }
    return stage_names.get(stage, f"第{stage}阶段")

async def run_analysis_background(analysis_id: int, audio_record_id: int, user_id: int):
    """后台运行完整分析"""
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        # 运行完整分析
        result = await analysis_service.run_full_analysis(db, audio_record_id, user_id)
        
        # 更新分析状态
        analysis = db.query(HealthAnalysis).filter(
            HealthAnalysis.id == analysis_id
        ).first()
        
        if analysis:
            if result["success"]:
                analysis.status = "completed"
                analysis.stage = 9
                analysis.stage_name = "完整九阶段分析"
                analysis.analysis_data = result["results"]
                analysis.confidence_score = 0.88
                from datetime import datetime
                analysis.completed_at = datetime.now()
            else:
                analysis.status = "failed"
                analysis.analysis_data = {"error": result["error"]}
            
            db.commit()
        
    except Exception as e:
        # 更新状态为失败
        analysis = db.query(HealthAnalysis).filter(
            HealthAnalysis.id == analysis_id
        ).first()
        
        if analysis:
            analysis.status = "failed"
            analysis.analysis_data = {"error": str(e)}
            db.commit()
        
        print(f"后台分析失败：{str(e)}")
        
    finally:
        db.close()
