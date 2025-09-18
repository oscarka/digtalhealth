"""
分析服务
协调九阶段分析流程
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models import (
    HealthAnalysis, HealthRequirement, SolutionModule, 
    SolutionTree, PersonalizedPlan, UserFeedback, HealthReport
)
from app.services.ai_service import AIService
from app.schemas import AnalysisStage
import asyncio
from datetime import datetime

class AnalysisService:
    """分析服务"""
    
    def __init__(self):
        self.ai_service = AIService()
    
    async def run_full_analysis(self, db: Session, audio_record_id: int, user_id: int) -> Dict[str, Any]:
        """
        运行完整的九阶段分析流程
        """
        try:
            analysis_results = {}
            
            # 第一阶段：多源数据采集与解析
            stage1_result = await self._stage1_data_collection(db, audio_record_id)
            analysis_results["stage1"] = stage1_result
            
            # 第二阶段：多维健康需求评估
            stage2_result = await self._stage2_multi_dimensional_assessment(stage1_result)
            analysis_results["stage2"] = stage2_result
            
            # 第三阶段：需求分析结果验证
            stage3_result = await self._stage3_requirement_validation(stage2_result)
            analysis_results["stage3"] = stage3_result
            
            # 第四阶段：整合需求形成框架
            stage4_result = await self._stage4_framework_integration(stage3_result)
            analysis_results["stage4"] = stage4_result
            
            # 第五阶段：框架排序
            stage5_result = await self._stage5_framework_ranking(stage4_result)
            analysis_results["stage5"] = stage5_result
            
            # 第六阶段：树形方案构建
            stage6_result = await self._stage6_solution_tree_construction(stage5_result)
            analysis_results["stage6"] = stage6_result
            
            # 第七阶段：个性化方案
            stage7_result = await self._stage7_personalized_planning(stage6_result)
            analysis_results["stage7"] = stage7_result
            
            # 保存分析结果到数据库
            await self._save_analysis_results(db, audio_record_id, user_id, analysis_results)
            
            return {
                "success": True,
                "analysis_id": analysis_results.get("analysis_id"),
                "stages_completed": len(analysis_results),
                "results": analysis_results
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "stages_completed": len(analysis_results) if "analysis_results" in locals() else 0
            }
    
    async def _stage1_data_collection(self, db: Session, audio_record_id: int) -> Dict[str, Any]:
        """第一阶段：多源数据采集与解析"""
        # 获取音频记录
        audio_record = db.query(AudioRecord).filter(AudioRecord.id == audio_record_id).first()
        if not audio_record:
            raise Exception("音频记录不存在")
        
        # 获取转写文本
        transcription = db.query(Transcription).filter(
            Transcription.audio_record_id == audio_record_id
        ).first()
        
        if not transcription:
            raise Exception("转写文本不存在")
        
        # 提取核心信息
        core_info = await self.ai_service.extract_core_information(transcription.text)
        
        return {
            "stage": 1,
            "stage_name": AnalysisStage.STAGE_1,
            "audio_record_id": audio_record_id,
            "transcription_text": transcription.text,
            "core_information": core_info,
            "confidence_score": transcription.confidence
        }
    
    async def _stage2_multi_dimensional_assessment(self, stage1_result: Dict[str, Any]) -> Dict[str, Any]:
        """第二阶段：多维健康需求评估"""
        core_info = stage1_result["core_information"]
        assessment_result = await self.ai_service.multi_dimensional_assessment(core_info)
        
        return {
            "stage": 2,
            "stage_name": AnalysisStage.STAGE_2,
            "multi_dimensional_assessment": assessment_result,
            "confidence_score": 0.85
        }
    
    async def _stage3_requirement_validation(self, stage2_result: Dict[str, Any]) -> Dict[str, Any]:
        """第三阶段：需求分析结果验证"""
        requirements = stage2_result["multi_dimensional_assessment"]
        validation_result = await self.ai_service.validate_requirements(requirements)
        
        return {
            "stage": 3,
            "stage_name": AnalysisStage.STAGE_3,
            "requirement_validation": validation_result,
            "confidence_score": 0.90
        }
    
    async def _stage4_framework_integration(self, stage3_result: Dict[str, Any]) -> Dict[str, Any]:
        """第四阶段：整合需求形成框架"""
        validated_requirements = stage3_result["requirement_validation"]
        modules_result = await self.ai_service.create_solution_modules(validated_requirements)
        
        return {
            "stage": 4,
            "stage_name": AnalysisStage.STAGE_4,
            "solution_modules": modules_result,
            "confidence_score": 0.88
        }
    
    async def _stage5_framework_ranking(self, stage4_result: Dict[str, Any]) -> Dict[str, Any]:
        """第五阶段：框架排序"""
        modules = stage4_result["solution_modules"]
        ranking_result = await self.ai_service.rank_modules(modules)
        
        return {
            "stage": 5,
            "stage_name": AnalysisStage.STAGE_5,
            "module_ranking": ranking_result,
            "confidence_score": 0.87
        }
    
    async def _stage6_solution_tree_construction(self, stage5_result: Dict[str, Any]) -> Dict[str, Any]:
        """第六阶段：树形方案构建"""
        ranked_modules = stage5_result["module_ranking"]["ranked_modules"]
        solution_trees = []
        
        for module in ranked_modules:
            tree_result = await self.ai_service.create_solution_tree(module)
            solution_trees.append(tree_result)
        
        return {
            "stage": 6,
            "stage_name": AnalysisStage.STAGE_6,
            "solution_trees": solution_trees,
            "confidence_score": 0.86
        }
    
    async def _stage7_personalized_planning(self, stage6_result: Dict[str, Any]) -> Dict[str, Any]:
        """第七阶段：个性化方案"""
        solution_trees = stage6_result["solution_trees"]
        customer_preferences = {
            "budget": "中等",
            "convenience": "高",
            "preferred_services": ["在线咨询", "家庭监测"]
        }
        
        personalized_plan = await self.ai_service.create_personalized_plan(
            solution_trees, customer_preferences
        )
        
        return {
            "stage": 7,
            "stage_name": AnalysisStage.STAGE_7,
            "personalized_plan": personalized_plan,
            "confidence_score": 0.89
        }
    
    async def _save_analysis_results(self, db: Session, audio_record_id: int, 
                                   user_id: int, analysis_results: Dict[str, Any]):
        """保存分析结果到数据库"""
        try:
            # 创建健康分析记录
            health_analysis = HealthAnalysis(
                audio_record_id=audio_record_id,
                user_id=user_id,
                stage=9,  # 完整分析
                stage_name="完整九阶段分析",
                analysis_data=analysis_results,
                confidence_score=0.88,
                status="completed",
                completed_at=datetime.now()
            )
            db.add(health_analysis)
            db.commit()
            db.refresh(health_analysis)
            
            # 保存健康需求
            if "stage3" in analysis_results:
                validated_requirements = analysis_results["stage3"]["requirement_validation"]["validated_requirements"]
                for req_data in validated_requirements:
                    health_req = HealthRequirement(
                        analysis_id=health_analysis.id,
                        dimension=req_data.get("dimension", "生物医学"),
                        requirement_type=req_data.get("requirement_type", "健康需求"),
                        description=req_data["requirement"],
                        reasoning_chain=req_data.get("reasoning", ""),
                        confidence_score=req_data.get("confidence_score", 0.8),
                        is_validated=True,
                        validation_source=req_data.get("validation_source", "AI分析")
                    )
                    db.add(health_req)
            
            # 保存解决方案模块
            if "stage5" in analysis_results:
                ranked_modules = analysis_results["stage5"]["module_ranking"]["ranked_modules"]
                for module_data in ranked_modules:
                    solution_module = SolutionModule(
                        analysis_id=health_analysis.id,
                        module_name=module_data["module_name"],
                        module_type="健康管理",
                        description=f"优先级排名：{module_data['rank']}",
                        priority_score=module_data["priority_score"],
                        disease_risk_score=module_data["disease_risk_score"],
                        improvement_score=module_data["improvement_score"],
                        acceptance_score=module_data["acceptance_score"]
                    )
                    db.add(solution_module)
            
            # 保存个性化方案
            if "stage7" in analysis_results:
                personalized_plan_data = analysis_results["stage7"]["personalized_plan"]
                personalized_plan = PersonalizedPlan(
                    user_id=user_id,
                    analysis_id=health_analysis.id,
                    plan_data=personalized_plan_data,
                    customer_preferences={"budget": "中等", "convenience": "高"},
                    reasoning_logic=personalized_plan_data.get("reasoning_logic", ""),
                    status="active"
                )
                db.add(personalized_plan)
            
            db.commit()
            
            # 更新分析结果中的ID
            analysis_results["analysis_id"] = health_analysis.id
            
        except Exception as e:
            db.rollback()
            raise Exception(f"保存分析结果失败：{str(e)}")
    
    async def adjust_plan_based_on_feedback(self, db: Session, plan_id: int, 
                                          feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        第八阶段：基于反馈动态调整方案
        """
        try:
            # 获取当前方案
            current_plan = db.query(PersonalizedPlan).filter(
                PersonalizedPlan.id == plan_id
            ).first()
            
            if not current_plan:
                raise Exception("方案不存在")
            
            # 使用AI服务进行动态调整
            adjusted_plan = await self.ai_service.adjust_plan_dynamically(
                current_plan.plan_data, feedback_data
            )
            
            # 更新方案
            current_plan.plan_data = adjusted_plan["adjusted_plan"]
            current_plan.updated_at = datetime.now()
            
            # 保存用户反馈
            user_feedback = UserFeedback(
                plan_id=plan_id,
                user_id=current_plan.user_id,
                feedback_type=feedback_data.get("type", "general"),
                feedback_data=feedback_data,
                health_metrics=feedback_data.get("health_metrics", {}),
                subjective_feelings=feedback_data.get("subjective_feelings", {}),
                behavior_changes=feedback_data.get("behavior_changes", {})
            )
            db.add(user_feedback)
            
            db.commit()
            
            return {
                "success": True,
                "adjusted_plan": adjusted_plan,
                "feedback_id": user_feedback.id
            }
            
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_periodic_report(self, db: Session, user_id: int, 
                                     plan_id: int) -> Dict[str, Any]:
        """
        第九阶段：生成定期反馈报告
        """
        try:
            # 获取方案数据
            plan = db.query(PersonalizedPlan).filter(
                PersonalizedPlan.id == plan_id,
                PersonalizedPlan.user_id == user_id
            ).first()
            
            if not plan:
                raise Exception("方案不存在")
            
            # 获取用户反馈历史
            feedback_history = db.query(UserFeedback).filter(
                UserFeedback.plan_id == plan_id
            ).order_by(UserFeedback.created_at.desc()).limit(10).all()
            
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
            health_report = await self.ai_service.generate_health_report(
                plan.plan_data, feedback_data
            )
            
            # 保存报告到数据库
            report = HealthReport(
                user_id=user_id,
                plan_id=plan_id,
                report_type="periodic",
                report_data=health_report,
                objective_metrics=health_report.get("objective_metrics", {}),
                subjective_improvements=health_report.get("subjective_improvements", {}),
                behavior_transformations=health_report.get("behavior_transformations", {}),
                visualization_data=health_report.get("visualization_data", {})
            )
            db.add(report)
            db.commit()
            
            return {
                "success": True,
                "report": health_report,
                "report_id": report.id
            }
            
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": str(e)
            }
