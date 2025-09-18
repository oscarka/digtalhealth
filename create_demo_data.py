"""
创建演示数据
为系统创建示例用户、音频记录、分析结果等数据
"""

import asyncio
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, AudioRecord, Transcription, HealthProfile, HealthAnalysis, HealthRequirement, SolutionModule, PersonalizedPlan, UserFeedback, HealthReport
from app.services.ai_service import AIService

# 创建所有表
Base.metadata.create_all(bind=engine)

def create_demo_users():
    """创建演示用户"""
    db = SessionLocal()
    try:
        # 创建管理员用户
        admin_user = User(
            username="admin",
            email="admin@healthsystem.com",
            full_name="系统管理员",
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        
        # 创建健康管理师
        manager_user = User(
            username="health_manager",
            email="manager@healthsystem.com",
            full_name="张健康",
            role="health_manager",
            is_active=True
        )
        db.add(manager_user)
        
        # 创建客户用户
        client_users = [
            User(
                username="client001",
                email="client001@example.com",
                full_name="李小明",
                role="client",
                is_active=True
            ),
            User(
                username="client002",
                email="client002@example.com",
                full_name="王小红",
                role="client",
                is_active=True
            ),
            User(
                username="client003",
                email="client003@example.com",
                full_name="赵小强",
                role="client",
                is_active=True
            )
        ]
        
        for user in client_users:
            db.add(user)
        
        db.commit()
        print("✅ 演示用户创建成功")
        
        return {
            "admin": admin_user.id,
            "manager": manager_user.id,
            "clients": [user.id for user in client_users]
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建演示用户失败：{str(e)}")
        return None
    finally:
        db.close()

def create_demo_audio_records(user_ids):
    """创建演示音频记录"""
    db = SessionLocal()
    try:
        audio_records = []
        
        # 为每个客户创建音频记录
        for i, user_id in enumerate(user_ids["clients"]):
            # 创建音频记录
            audio_record = AudioRecord(
                user_id=user_id,
                filename=f"health_consultation_{i+1}.mp3",
                file_path=f"uploads/demo_audio_{i+1}.mp3",
                file_size=1024000 + i * 100000,  # 1MB + 变化
                duration=120.5 + i * 30,  # 2分钟 + 变化
                format="mp3",
                status="completed",
                created_at=datetime.now() - timedelta(days=7-i)
            )
            db.add(audio_record)
            db.flush()  # 获取ID
            
            # 创建转写记录
            transcription_texts = [
                "医生您好，我最近总是感觉疲劳，晚上睡不好觉，白天工作也没精神。我今年35岁，在IT公司工作，经常加班到很晚。家里有高血压家族史，我父亲就是高血压患者。我想咨询一下我的情况是否需要去医院检查。",
                "医生，我是一名45岁的女性，最近几个月总是感觉胸闷气短，特别是爬楼梯的时候。我平时工作压力比较大，经常熬夜，饮食也不太规律。我想了解一下我的症状可能是什么原因引起的。",
                "医生您好，我今年28岁，最近总是感觉焦虑不安，晚上经常失眠，白天注意力不集中。我是一名程序员，工作强度很大，经常需要加班。我想咨询一下如何改善我的心理状态和睡眠质量。"
            ]
            
            transcription = Transcription(
                audio_record_id=audio_record.id,
                text=transcription_texts[i],
                confidence=0.95 - i * 0.02,
                language="zh-CN",
                created_at=audio_record.created_at
            )
            db.add(transcription)
            
            audio_records.append(audio_record)
        
        db.commit()
        print("✅ 演示音频记录创建成功")
        
        return audio_records
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建演示音频记录失败：{str(e)}")
        return []
    finally:
        db.close()

def create_demo_health_profiles(user_ids):
    """创建演示健康简历"""
    db = SessionLocal()
    try:
        health_profiles = []
        
        profile_data_examples = [
            {
                "basic_info": {
                    "age": "35",
                    "gender": "男",
                    "occupation": "IT工程师",
                    "family_history": ["高血压家族史"]
                },
                "symptoms": [
                    {
                        "description": "疲劳",
                        "location": "全身",
                        "severity": "中等",
                        "duration": "最近"
                    },
                    {
                        "description": "失眠",
                        "location": "睡眠",
                        "severity": "中等",
                        "duration": "最近"
                    }
                ],
                "background": {
                    "medical_history": [],
                    "surgical_history": [],
                    "allergies": [],
                    "lifestyle": {
                        "smoking": "无",
                        "drinking": "偶尔",
                        "exercise": "缺乏",
                        "diet": "不规律"
                    }
                },
                "medications": []
            },
            {
                "basic_info": {
                    "age": "45",
                    "gender": "女",
                    "occupation": "企业高管",
                    "family_history": ["心脏病家族史"]
                },
                "symptoms": [
                    {
                        "description": "胸闷气短",
                        "location": "胸部",
                        "severity": "中等",
                        "duration": "几个月"
                    }
                ],
                "background": {
                    "medical_history": [],
                    "surgical_history": [],
                    "allergies": [],
                    "lifestyle": {
                        "smoking": "无",
                        "drinking": "偶尔",
                        "exercise": "缺乏",
                        "diet": "不规律"
                    }
                },
                "medications": []
            },
            {
                "basic_info": {
                    "age": "28",
                    "gender": "男",
                    "occupation": "程序员",
                    "family_history": []
                },
                "symptoms": [
                    {
                        "description": "焦虑不安",
                        "location": "心理",
                        "severity": "中等",
                        "duration": "最近"
                    },
                    {
                        "description": "失眠",
                        "location": "睡眠",
                        "severity": "中等",
                        "duration": "最近"
                    }
                ],
                "background": {
                    "medical_history": [],
                    "surgical_history": [],
                    "allergies": [],
                    "lifestyle": {
                        "smoking": "无",
                        "drinking": "偶尔",
                        "exercise": "缺乏",
                        "diet": "不规律"
                    }
                },
                "medications": []
            }
        ]
        
        narrative_examples = [
            "李小明，35岁男性，IT工程师，有高血压家族史。最近出现疲劳和失眠症状，工作压力大，经常加班，缺乏运动，饮食不规律。",
            "王小红，45岁女性，企业高管，有心脏病家族史。最近几个月出现胸闷气短症状，工作压力大，经常熬夜，饮食不规律。",
            "赵小强，28岁男性，程序员，无家族病史。最近出现焦虑不安和失眠症状，工作强度大，经常加班，缺乏运动。"
        ]
        
        for i, user_id in enumerate(user_ids["clients"]):
            health_profile = HealthProfile(
                user_id=user_id,
                profile_data=profile_data_examples[i],
                narrative=narrative_examples[i],
                version=1,
                created_at=datetime.now() - timedelta(days=6-i)
            )
            db.add(health_profile)
            health_profiles.append(health_profile)
        
        db.commit()
        print("✅ 演示健康简历创建成功")
        
        return health_profiles
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建演示健康简历失败：{str(e)}")
        return []
    finally:
        db.close()

def create_demo_health_analyses(audio_records):
    """创建演示健康分析"""
    db = SessionLocal()
    try:
        health_analyses = []
        
        for i, audio_record in enumerate(audio_records):
            # 创建健康分析记录
            analysis_data = {
                "stage1": {
                    "stage": 1,
                    "stage_name": "多源数据采集与解析",
                    "core_information": {
                        "basic_info": {
                            "age": "35" if i == 0 else "45" if i == 1 else "28",
                            "gender": "男" if i != 1 else "女",
                            "occupation": "IT工程师" if i == 0 else "企业高管" if i == 1 else "程序员"
                        },
                        "symptoms": [
                            {"description": "疲劳", "location": "全身", "severity": "中等"},
                            {"description": "失眠", "location": "睡眠", "severity": "中等"}
                        ]
                    }
                },
                "stage2": {
                    "stage": 2,
                    "stage_name": "多维健康需求评估",
                    "multi_dimensional_assessment": {
                        "dimensions": {
                            "biomedical": [
                                {
                                    "requirement": "血压监测和心血管风险评估",
                                    "reasoning": "家族高血压史 + 工作压力 + 缺乏运动 → 高血压风险增加",
                                    "confidence": 0.85
                                }
                            ],
                            "psychological": [
                                {
                                    "requirement": "压力管理和心理支持",
                                    "reasoning": "IT工作996 + 疲劳症状 → 工作压力过大",
                                    "confidence": 0.80
                                }
                            ]
                        }
                    }
                },
                "stage3": {
                    "stage": 3,
                    "stage_name": "需求分析结果验证",
                    "requirement_validation": {
                        "validated_requirements": [
                            {
                                "requirement": "血压监测和心血管风险评估",
                                "validation_result": "验证通过",
                                "confidence_score": 0.85,
                                "validation_source": "医学指南和临床研究"
                            }
                        ]
                    }
                }
            }
            
            health_analysis = HealthAnalysis(
                audio_record_id=audio_record.id,
                user_id=audio_record.user_id,
                stage=9,
                stage_name="完整九阶段分析",
                analysis_data=analysis_data,
                confidence_score=0.88,
                status="completed",
                created_at=audio_record.created_at + timedelta(minutes=5),
                completed_at=audio_record.created_at + timedelta(minutes=5)
            )
            db.add(health_analysis)
            db.flush()
            
            # 创建健康需求
            health_requirement = HealthRequirement(
                analysis_id=health_analysis.id,
                dimension="生物医学",
                requirement_type="心血管健康管理",
                description="血压监测和心血管风险评估",
                reasoning_chain="家族高血压史 + 工作压力 + 缺乏运动 → 高血压风险增加",
                confidence_score=0.85,
                priority_score=0.80,
                is_validated=True,
                validation_source="医学指南和临床研究"
            )
            db.add(health_requirement)
            db.flush()  # 获取ID
            
            # 创建解决方案模块
            solution_module = SolutionModule(
                analysis_id=health_analysis.id,
                module_name="心血管健康管理模块",
                module_type="疾病预防",
                description="针对高血压家族史和工作压力的心血管疾病预防",
                requirements=[health_requirement.id],
                metrics={
                    "key_indicators": ["血压", "心率", "胆固醇", "血糖"],
                    "measurement_methods": ["血压计", "心电图", "血液检查"],
                    "target_values": ["<140/90mmHg", "60-100bpm", "<5.2mmol/L", "<6.1mmol/L"]
                },
                priority_score=0.80,
                disease_risk_score=0.85,
                improvement_score=0.75,
                acceptance_score=0.80
            )
            db.add(solution_module)
            
            health_analyses.append(health_analysis)
        
        db.commit()
        print("✅ 演示健康分析创建成功")
        
        return health_analyses
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建演示健康分析失败：{str(e)}")
        return []
    finally:
        db.close()

def create_demo_personalized_plans(health_analyses):
    """创建演示个性化方案"""
    db = SessionLocal()
    try:
        personalized_plans = []
        
        plan_examples = [
            {
                "plan_summary": "基于您的IT工作背景、家族高血压史和预算考虑，优先推荐家庭监测设备，配合专业营养指导",
                "modules": [
                    {
                        "module_name": "心血管健康管理",
                        "priority": 1,
                        "services": [
                            {
                                "service_name": "家庭血压监测套装",
                                "service_type": "设备服务",
                                "frequency": "每日",
                                "duration": "长期",
                                "cost": "299元",
                                "convenience": "高"
                            }
                        ]
                    }
                ],
                "reasoning_logic": "基于您的IT工作背景、家族高血压史和预算考虑，优先推荐家庭监测设备，配合专业营养指导，既经济又便利",
                "expected_outcomes": ["血压稳定", "睡眠改善", "疲劳缓解"],
                "monitoring_plan": ["每周血压记录", "每月健康评估", "每季度方案调整"]
            },
            {
                "plan_summary": "针对您的胸闷气短症状和心脏病家族史，制定综合心血管健康管理方案",
                "modules": [
                    {
                        "module_name": "心血管健康管理",
                        "priority": 1,
                        "services": [
                            {
                                "service_name": "心血管健康评估",
                                "service_type": "检查服务",
                                "frequency": "每季度",
                                "duration": "1年",
                                "cost": "800元",
                                "convenience": "中"
                            }
                        ]
                    }
                ],
                "reasoning_logic": "基于您的胸闷气短症状、心脏病家族史和工作压力，需要全面的心血管健康评估和监测",
                "expected_outcomes": ["症状缓解", "心血管健康改善", "生活质量提升"],
                "monitoring_plan": ["每月症状记录", "每季度健康评估", "年度全面检查"]
            },
            {
                "plan_summary": "针对您的焦虑和失眠问题，制定心理健康和睡眠改善方案",
                "modules": [
                    {
                        "module_name": "心理健康管理",
                        "priority": 1,
                        "services": [
                            {
                                "service_name": "心理咨询服务",
                                "service_type": "咨询服务",
                                "frequency": "每周1次",
                                "duration": "3个月",
                                "cost": "1200元",
                                "convenience": "中"
                            }
                        ]
                    }
                ],
                "reasoning_logic": "基于您的焦虑不安、失眠症状和工作压力，需要专业的心理支持和睡眠改善指导",
                "expected_outcomes": ["焦虑缓解", "睡眠质量改善", "工作状态提升"],
                "monitoring_plan": ["每周心理状态记录", "每月睡眠质量评估", "每季度方案调整"]
            }
        ]
        
        for i, health_analysis in enumerate(health_analyses):
            personalized_plan = PersonalizedPlan(
                user_id=health_analysis.user_id,
                analysis_id=health_analysis.id,
                plan_data=plan_examples[i],
                customer_preferences={
                    "budget": "中等",
                    "convenience": "高",
                    "preferred_services": ["在线咨询", "家庭监测"]
                },
                reasoning_logic=plan_examples[i]["reasoning_logic"],
                status="active",
                created_at=health_analysis.completed_at + timedelta(minutes=10)
            )
            db.add(personalized_plan)
            personalized_plans.append(personalized_plan)
        
        db.commit()
        print("✅ 演示个性化方案创建成功")
        
        return personalized_plans
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建演示个性化方案失败：{str(e)}")
        return []
    finally:
        db.close()

def create_demo_user_feedbacks(personalized_plans):
    """创建演示用户反馈"""
    db = SessionLocal()
    try:
        user_feedbacks = []
        
        feedback_examples = [
            {
                "feedback_type": "wearable_data",
                "feedback_data": {
                    "device": "智能手环",
                    "data_period": "最近一周"
                },
                "health_metrics": {
                    "blood_pressure": "135/85",
                    "heart_rate": "75",
                    "sleep_duration": "7.5小时",
                    "steps": "8500"
                },
                "subjective_feelings": {
                    "energy_level": "中等",
                    "sleep_quality": "良好",
                    "mood": "稳定"
                },
                "behavior_changes": {
                    "exercise_frequency": "每周3次",
                    "diet_habits": "减少高盐食物",
                    "sleep_schedule": "更加规律"
                }
            },
            {
                "feedback_type": "questionnaire",
                "feedback_data": {
                    "questionnaire_type": "健康状态评估",
                    "completion_date": "2024-01-15"
                },
                "health_metrics": {
                    "blood_pressure": "140/90",
                    "heart_rate": "80",
                    "weight": "65kg"
                },
                "subjective_feelings": {
                    "energy_level": "较低",
                    "sleep_quality": "一般",
                    "mood": "焦虑"
                },
                "behavior_changes": {
                    "exercise_frequency": "每周1次",
                    "diet_habits": "不规律",
                    "sleep_schedule": "不规律"
                }
            },
            {
                "feedback_type": "medical_report",
                "feedback_data": {
                    "report_type": "心理健康评估",
                    "assessment_date": "2024-01-20"
                },
                "health_metrics": {
                    "anxiety_score": "中等",
                    "sleep_efficiency": "75%",
                    "stress_level": "高"
                },
                "subjective_feelings": {
                    "energy_level": "较低",
                    "sleep_quality": "较差",
                    "mood": "焦虑不安"
                },
                "behavior_changes": {
                    "exercise_frequency": "无",
                    "diet_habits": "不规律",
                    "sleep_schedule": "严重不规律"
                }
            }
        ]
        
        for i, plan in enumerate(personalized_plans):
            # 为每个方案创建多个反馈记录
            for j in range(3):  # 每个方案3个反馈
                feedback_date = plan.created_at + timedelta(days=j*7)  # 每周一个反馈
                
                user_feedback = UserFeedback(
                    plan_id=plan.id,
                    user_id=plan.user_id,
                    feedback_type=feedback_examples[i]["feedback_type"],
                    feedback_data=feedback_examples[i]["feedback_data"],
                    health_metrics=feedback_examples[i]["health_metrics"],
                    subjective_feelings=feedback_examples[i]["subjective_feelings"],
                    behavior_changes=feedback_examples[i]["behavior_changes"],
                    created_at=feedback_date
                )
                db.add(user_feedback)
                user_feedbacks.append(user_feedback)
        
        db.commit()
        print("✅ 演示用户反馈创建成功")
        
        return user_feedbacks
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建演示用户反馈失败：{str(e)}")
        return []
    finally:
        db.close()

def create_demo_health_reports(personalized_plans):
    """创建演示健康报告"""
    db = SessionLocal()
    try:
        health_reports = []
        
        report_examples = [
            {
                "report_type": "periodic",
                "report_data": {
                    "report_period": "2024年1月",
                    "summary": "整体健康状况显著改善，血压趋于稳定，睡眠质量提升",
                    "objective_metrics": {
                        "blood_pressure": {
                            "baseline": "150/95mmHg",
                            "current": "135/85mmHg",
                            "improvement": "15/10mmHg下降",
                            "trend": "持续改善"
                        }
                    },
                    "subjective_improvements": {
                        "energy_level": "日间疲劳明显缓解",
                        "sleep_quality": "入睡时间缩短，睡眠深度增加",
                        "mood": "工作压力感减轻，情绪状态改善"
                    },
                    "behavior_transformations": {
                        "exercise_frequency": "从无运动增加到每周3次",
                        "diet_habits": "减少高盐高脂食物摄入",
                        "sleep_schedule": "作息时间更加规律"
                    },
                    "service_value": "家庭血压监测和营养指导服务有效支持了健康改善",
                    "recommendations": ["继续坚持当前方案", "增加运动强度", "定期复查"]
                },
                "objective_metrics": {
                    "blood_pressure": "135/85mmHg",
                    "heart_rate": "75bpm",
                    "weight": "70kg"
                },
                "subjective_improvements": {
                    "energy_level": "良好",
                    "sleep_quality": "良好",
                    "mood": "稳定"
                },
                "behavior_transformations": {
                    "exercise_frequency": "每周3次",
                    "diet_habits": "改善",
                    "sleep_schedule": "规律"
                }
            },
            {
                "report_type": "improvement",
                "report_data": {
                    "report_period": "2024年1月",
                    "summary": "胸闷气短症状有所缓解，心血管健康指标改善",
                    "objective_metrics": {
                        "blood_pressure": {
                            "baseline": "145/90mmHg",
                            "current": "140/85mmHg",
                            "improvement": "5/5mmHg下降",
                            "trend": "逐步改善"
                        }
                    },
                    "subjective_improvements": {
                        "energy_level": "胸闷症状缓解",
                        "sleep_quality": "睡眠质量有所改善",
                        "mood": "工作压力感减轻"
                    },
                    "behavior_transformations": {
                        "exercise_frequency": "从无运动增加到每周2次",
                        "diet_habits": "减少高盐食物摄入",
                        "sleep_schedule": "作息时间有所改善"
                    },
                    "service_value": "心血管健康评估和监测服务有效支持了症状改善",
                    "recommendations": ["继续监测血压", "增加有氧运动", "定期复查"]
                },
                "objective_metrics": {
                    "blood_pressure": "140/85mmHg",
                    "heart_rate": "78bpm",
                    "weight": "65kg"
                },
                "subjective_improvements": {
                    "energy_level": "中等",
                    "sleep_quality": "一般",
                    "mood": "稳定"
                },
                "behavior_transformations": {
                    "exercise_frequency": "每周2次",
                    "diet_habits": "改善",
                    "sleep_schedule": "有所改善"
                }
            },
            {
                "report_type": "summary",
                "report_data": {
                    "report_period": "2024年1月",
                    "summary": "焦虑症状有所缓解，睡眠质量逐步改善",
                    "objective_metrics": {
                        "anxiety_score": {
                            "baseline": "高",
                            "current": "中等",
                            "improvement": "焦虑程度下降",
                            "trend": "逐步改善"
                        }
                    },
                    "subjective_improvements": {
                        "energy_level": "焦虑感有所缓解",
                        "sleep_quality": "入睡困难有所改善",
                        "mood": "情绪状态趋于稳定"
                    },
                    "behavior_transformations": {
                        "exercise_frequency": "从无运动增加到每周1次",
                        "diet_habits": "开始注意饮食规律",
                        "sleep_schedule": "作息时间有所改善"
                    },
                    "service_value": "心理咨询和睡眠指导服务有效支持了心理状态改善",
                    "recommendations": ["继续心理咨询", "坚持睡眠改善方案", "增加运动频率"]
                },
                "objective_metrics": {
                    "anxiety_score": "中等",
                    "sleep_efficiency": "80%",
                    "stress_level": "中等"
                },
                "subjective_improvements": {
                    "energy_level": "中等",
                    "sleep_quality": "一般",
                    "mood": "稳定"
                },
                "behavior_transformations": {
                    "exercise_frequency": "每周1次",
                    "diet_habits": "有所改善",
                    "sleep_schedule": "有所改善"
                }
            }
        ]
        
        for i, plan in enumerate(personalized_plans):
            health_report = HealthReport(
                user_id=plan.user_id,
                plan_id=plan.id,
                report_type=report_examples[i]["report_type"],
                report_data=report_examples[i]["report_data"],
                objective_metrics=report_examples[i]["objective_metrics"],
                subjective_improvements=report_examples[i]["subjective_improvements"],
                behavior_transformations=report_examples[i]["behavior_transformations"],
                visualization_data={
                    "charts": [
                        {"type": "line", "title": "血压变化趋势", "data": "血压数据"},
                        {"type": "bar", "title": "睡眠质量改善", "data": "睡眠数据"}
                    ]
                },
                created_at=plan.created_at + timedelta(days=30)
            )
            db.add(health_report)
            health_reports.append(health_report)
        
        db.commit()
        print("✅ 演示健康报告创建成功")
        
        return health_reports
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建演示健康报告失败：{str(e)}")
        return []
    finally:
        db.close()

def main():
    """主函数：创建所有演示数据"""
    print("🚀 开始创建演示数据...")
    
    # 1. 创建用户
    print("\n📝 创建演示用户...")
    user_ids = create_demo_users()
    if not user_ids:
        print("❌ 用户创建失败，终止演示数据创建")
        return
    
    # 2. 创建音频记录
    print("\n🎵 创建演示音频记录...")
    audio_records = create_demo_audio_records(user_ids)
    if not audio_records:
        print("❌ 音频记录创建失败，终止演示数据创建")
        return
    
    # 3. 创建健康简历
    print("\n📋 创建演示健康简历...")
    health_profiles = create_demo_health_profiles(user_ids)
    
    # 4. 创建健康分析
    print("\n🧠 创建演示健康分析...")
    health_analyses = create_demo_health_analyses(audio_records)
    if not health_analyses:
        print("❌ 健康分析创建失败，终止演示数据创建")
        return
    
    # 5. 创建个性化方案
    print("\n📊 创建演示个性化方案...")
    personalized_plans = create_demo_personalized_plans(health_analyses)
    if not personalized_plans:
        print("❌ 个性化方案创建失败，终止演示数据创建")
        return
    
    # 6. 创建用户反馈
    print("\n💬 创建演示用户反馈...")
    user_feedbacks = create_demo_user_feedbacks(personalized_plans)
    
    # 7. 创建健康报告
    print("\n📈 创建演示健康报告...")
    health_reports = create_demo_health_reports(personalized_plans)
    
    print("\n🎉 演示数据创建完成！")
    print(f"✅ 创建了 {len(user_ids['clients'])} 个客户用户")
    print(f"✅ 创建了 {len(audio_records)} 个音频记录")
    print(f"✅ 创建了 {len(health_profiles)} 个健康简历")
    print(f"✅ 创建了 {len(health_analyses)} 个健康分析")
    print(f"✅ 创建了 {len(personalized_plans)} 个个性化方案")
    print(f"✅ 创建了 {len(user_feedbacks)} 个用户反馈")
    print(f"✅ 创建了 {len(health_reports)} 个健康报告")
    
    print("\n📋 演示用户信息：")
    print("管理员：admin / admin@healthsystem.com")
    print("健康管理师：health_manager / manager@healthsystem.com")
    print("客户1：client001 / client001@example.com")
    print("客户2：client002 / client002@example.com")
    print("客户3：client003 / client003@example.com")

if __name__ == "__main__":
    main()
