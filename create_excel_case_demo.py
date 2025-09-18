"""
基于Excel案例创建演示数据
"""

import asyncio
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, AudioRecord, Transcription, HealthProfile, HealthAnalysis, HealthRequirement, SolutionModule, PersonalizedPlan, UserFeedback, HealthReport

# 创建所有表
Base.metadata.create_all(bind=engine)

def create_excel_case_demo():
    """基于Excel案例创建演示数据"""
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
        
        # 创建Excel案例客户用户
        excel_client = User(
            username="excel_case_client",
            email="excel_case@example.com",
            full_name="李工程师",
            role="client",
            is_active=True
        )
        db.add(excel_client)
        
        db.commit()
        db.refresh(excel_client)
        
        # 创建Excel案例音频记录
        audio_record = AudioRecord(
            user_id=excel_client.id,
            filename="excel_case_consultation.mp3",
            file_path="uploads/excel_case_audio.mp3",
            file_size=2048000,
            duration=180.5,
            format="mp3",
            status="completed",
            created_at=datetime.now() - timedelta(days=7)
        )
        db.add(audio_record)
        db.commit()
        db.refresh(audio_record)
        
        # 创建Excel案例转写记录
        transcription = Transcription(
            audio_record_id=audio_record.id,
            text="医生您好，我是一名42岁的IT工程师，已婚有一个孩子。最近总是感觉疲劳，晚上睡不好觉，白天工作也没精神。工作压力比较大，经常需要加班。我想咨询一下我的情况是否需要去医院检查。我的身高是178cm，体重82kg。",
            confidence=0.95,
            language="zh-CN",
            created_at=audio_record.created_at
        )
        db.add(transcription)
        db.commit()
        
        # 创建Excel案例健康简历
        health_profile = HealthProfile(
            user_id=excel_client.id,
            profile_data={
                "basic_info": {
                    "age": "42",
                    "gender": "男",
                    "occupation": "IT工程师",
                    "education": "本科学历",
                    "marital_status": "已婚有一子",
                    "height": "178cm",
                    "weight": "82kg",
                    "bmi": "25.9"
                },
                "symptoms": [
                    {
                        "description": "疲劳感增加",
                        "location": "全身",
                        "severity": "中等",
                        "duration": "最近"
                    },
                    {
                        "description": "睡眠质量下降",
                        "location": "睡眠",
                        "severity": "中等",
                        "duration": "最近"
                    },
                    {
                        "description": "工作压力大",
                        "location": "心理",
                        "severity": "中等",
                        "duration": "持续"
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
                        "diet": "不规律",
                        "work_schedule": "经常加班"
                    }
                },
                "medications": []
            },
            narrative="李工程师，42岁男性，IT工程师，本科学历，已婚有一子。身高178cm，体重82kg，BMI 25.9。最近出现疲劳感增加、睡眠质量下降、工作压力大等症状，经常需要加班。",
            version=1,
            created_at=datetime.now() - timedelta(days=6)
        )
        db.add(health_profile)
        db.commit()
        
        # 创建Excel案例健康分析
        health_analysis = HealthAnalysis(
            audio_record_id=audio_record.id,
            user_id=excel_client.id,
            stage=9,
            stage_name="完整九阶段分析",
            analysis_data={
                "stage1": {
                    "stage": 1,
                    "stage_name": "多源数据采集与解析",
                    "core_information": {
                        "basic_info": {
                            "age": "42",
                            "gender": "男",
                            "occupation": "IT工程师",
                            "education": "本科学历",
                            "marital_status": "已婚有一子",
                            "height": "178cm",
                            "weight": "82kg",
                            "bmi": "25.9"
                        },
                        "symptoms": [
                            {"description": "疲劳感增加", "location": "全身", "severity": "中等"},
                            {"description": "睡眠质量下降", "location": "睡眠", "severity": "中等"},
                            {"description": "工作压力大", "location": "心理", "severity": "中等"}
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
                                    "requirement": "心血管健康风险评估",
                                    "reasoning": "职业压力与冠心病死亡率关联分析 → 长期高压力职业者心血管事件风险↑40%",
                                    "confidence": 0.90
                                },
                                {
                                    "requirement": "代谢风险预警",
                                    "reasoning": "超重（BMI 25.9）→ 腹腔脂肪堆积 → 胰岛素抵抗风险↑",
                                    "confidence": 0.85
                                }
                            ],
                            "psychological": [
                                {
                                    "requirement": "压力管理和心理支持",
                                    "reasoning": "IT工作996 + 疲劳症状 → 工作压力过大",
                                    "confidence": 0.85
                                }
                            ],
                            "social_environment": [
                                {
                                    "requirement": "工作生活平衡调整",
                                    "reasoning": "IT行业加班文化 → 生活作息不规律",
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
                                "requirement": "心血管健康风险评估",
                                "validation_result": "验证通过",
                                "confidence_score": 0.90,
                                "validation_source": "医学指南和临床研究",
                                "individual_factors": ["IT行业工作压力", "BMI 25.9超重", "42岁中年期"]
                            }
                        ]
                    }
                },
                "stage4": {
                    "stage": 4,
                    "stage_name": "整合需求形成框架",
                    "solution_modules": {
                        "modules": [
                            {
                                "module_name": "C1 睡眠-交感型疲劳系统",
                                "module_type": "综合健康管理",
                                "description": "涉及睡眠紊乱、压力引发的交感激活、生理恢复障碍等问题",
                                "requirements": ["心血管健康风险评估", "压力管理和心理支持", "睡眠质量改善"],
                                "metrics": {
                                    "key_indicators": ["心率变异性 HRV", "皮质醇节律", "ASCVD 风险评分"],
                                    "measurement_methods": ["可穿戴设备", "血液检测", "专业评估"],
                                    "target_values": ["HRV正常范围", "皮质醇节律正常", "ASCVD风险<5%"]
                                }
                            },
                            {
                                "module_name": "C2 代谢风险预警系统",
                                "module_type": "代谢健康管理",
                                "description": "关注因 BMI 超标、久坐、激素紊乱等引起的胰岛素抵抗、脂肪肝、糖尿病前期等代谢异常趋势",
                                "requirements": ["代谢风险预警", "工作生活平衡调整"],
                                "metrics": {
                                    "key_indicators": ["空腹血糖", "餐后2小时血糖", "胰岛素", "HbA1c"],
                                    "measurement_methods": ["血液检查", "体脂率测量", "腰围测量"],
                                    "target_values": ["<6.1mmol/L", "<7.8mmol/L", "正常范围", "<6.5%"]
                                }
                            }
                        ]
                    }
                },
                "stage5": {
                    "stage": 5,
                    "stage_name": "框架排序",
                    "module_ranking": {
                        "ranked_modules": [
                            {
                                "module_name": "C1 睡眠-交感型疲劳系统",
                                "disease_risk_score": 0.85,
                                "improvement_score": 0.80,
                                "acceptance_score": 0.75,
                                "priority_score": 0.80,
                                "rank": 1
                            },
                            {
                                "module_name": "C2 代谢风险预警系统",
                                "disease_risk_score": 0.80,
                                "improvement_score": 0.75,
                                "acceptance_score": 0.85,
                                "priority_score": 0.79,
                                "rank": 2
                            }
                        ]
                    }
                }
            },
            confidence_score=0.88,
            status="completed",
            created_at=audio_record.created_at + timedelta(minutes=5),
            completed_at=audio_record.created_at + timedelta(minutes=5)
        )
        db.add(health_analysis)
        db.flush()
        
        # 创建健康需求
        health_requirement1 = HealthRequirement(
            analysis_id=health_analysis.id,
            dimension="生物医学",
            requirement_type="心血管健康风险评估",
            description="职业压力与冠心病死亡率关联分析 → 长期高压力职业者心血管事件风险↑40%",
            reasoning_chain="IT工作压力 + BMI 25.9 + 42岁中年期 → 心血管疾病风险增加",
            confidence_score=0.90,
            priority_score=0.85,
            is_validated=True,
            validation_source="医学指南和临床研究"
        )
        db.add(health_requirement1)
        db.flush()
        
        health_requirement2 = HealthRequirement(
            analysis_id=health_analysis.id,
            dimension="生物医学",
            requirement_type="代谢风险预警",
            description="超重（BMI 25.9）→ 腹腔脂肪堆积 → 胰岛素抵抗风险↑",
            reasoning_chain="BMI 25.9 + 久坐工作 + 不规律饮食 → 代谢异常风险增加",
            confidence_score=0.85,
            priority_score=0.80,
            is_validated=True,
            validation_source="内分泌学指南"
        )
        db.add(health_requirement2)
        db.flush()
        
        # 创建解决方案模块
        solution_module1 = SolutionModule(
            analysis_id=health_analysis.id,
            module_name="C1 睡眠-交感型疲劳系统",
            module_type="综合健康管理",
            description="涉及睡眠紊乱、压力引发的交感激活、生理恢复障碍等问题，常表现为疲劳、浅睡、早醒、白天无精打采等",
            requirements=[health_requirement1.id],
            metrics={
                "key_indicators": ["心率变异性 HRV", "皮质醇节律", "ASCVD 风险评分"],
                "measurement_methods": ["可穿戴设备", "血液检测", "专业评估"],
                "target_values": ["HRV正常范围", "皮质醇节律正常", "ASCVD风险<5%"]
            },
            priority_score=0.80,
            disease_risk_score=0.85,
            improvement_score=0.80,
            acceptance_score=0.75
        )
        db.add(solution_module1)
        db.flush()
        
        solution_module2 = SolutionModule(
            analysis_id=health_analysis.id,
            module_name="C2 代谢风险预警系统",
            module_type="代谢健康管理",
            description="关注因 BMI 超标、久坐、激素紊乱等引起的胰岛素抵抗、脂肪肝、糖尿病前期等代谢异常趋势",
            requirements=[health_requirement2.id],
            metrics={
                "key_indicators": ["空腹血糖", "餐后2小时血糖", "胰岛素", "HbA1c"],
                "measurement_methods": ["血液检查", "体脂率测量", "腰围测量"],
                "target_values": ["<6.1mmol/L", "<7.8mmol/L", "正常范围", "<6.5%"]
            },
            priority_score=0.79,
            disease_risk_score=0.80,
            improvement_score=0.75,
            acceptance_score=0.85
        )
        db.add(solution_module2)
        
        # 创建个性化方案
        personalized_plan = PersonalizedPlan(
            user_id=excel_client.id,
            analysis_id=health_analysis.id,
            plan_data={
                "plan_summary": "基于您的IT工作背景、BMI 25.9和压力状况，优先推荐睡眠-交感型疲劳管理方案",
                "modules": [
                    {
                        "module_name": "C1 睡眠-交感型疲劳系统",
                        "priority": 1,
                        "services": [
                            {
                                "service_name": "HRV压力监测套装",
                                "service_type": "设备服务",
                                "frequency": "每日",
                                "duration": "3个月",
                                "cost": "1200元",
                                "convenience": "高",
                                "customer_preference": "💰 中高价位（500–1500元）；偏好非医疗语言的数字反馈服务"
                            },
                            {
                                "service_name": "睡眠质量改善指导",
                                "service_type": "咨询服务",
                                "frequency": "每周1次",
                                "duration": "2个月",
                                "cost": "800元",
                                "convenience": "中",
                                "customer_preference": "💰 中价位（300–800元）；愿尝试物理缓解工具与自助评估服务"
                            }
                        ]
                    },
                    {
                        "module_name": "C2 代谢风险预警系统",
                        "priority": 2,
                        "services": [
                            {
                                "service_name": "血糖监测套装",
                                "service_type": "设备服务",
                                "frequency": "每周2次",
                                "duration": "长期",
                                "cost": "600元",
                                "convenience": "高",
                                "customer_preference": "💰 中高价位（500–1500元）；偏好数字反馈+非诊断化语言"
                            }
                        ]
                    }
                ],
                "reasoning_logic": "基于您的IT工作背景、BMI 25.9超重状况和工作压力，优先推荐HRV压力监测和睡眠改善服务，既符合您的预算范围又满足非医疗化服务偏好",
                "expected_outcomes": ["压力水平降低", "睡眠质量改善", "疲劳感缓解", "代谢指标改善"],
                "monitoring_plan": ["每周HRV监测", "每月睡眠质量评估", "每季度代谢指标检查"]
            },
            customer_preferences={
                "budget": "中高价位（500-1500元）",
                "convenience": "高",
                "preferred_services": ["非医疗语言数字反馈", "物理缓解工具", "自助评估服务"]
            },
            reasoning_logic="基于您的IT工作背景、BMI 25.9超重状况和工作压力，优先推荐HRV压力监测和睡眠改善服务，既符合您的预算范围又满足非医疗化服务偏好",
            status="active",
            created_at=health_analysis.completed_at + timedelta(minutes=10)
        )
        db.add(personalized_plan)
        db.flush()
        
        # 创建用户反馈
        user_feedback = UserFeedback(
            plan_id=personalized_plan.id,
            user_id=excel_client.id,
            feedback_type="wearable_data",
            feedback_data={
                "device": "HRV监测设备",
                "data_period": "最近一周"
            },
            health_metrics={
                "hrv_stress_index": "中等压力状态",
                "sleep_efficiency": "75%",
                "heart_rate_variability": "正常范围"
            },
            subjective_feelings={
                "energy_level": "中等",
                "sleep_quality": "有所改善",
                "mood": "稳定"
            },
            behavior_changes={
                "stress_management": "学会压力管理技巧",
                "sleep_schedule": "作息时间更加规律",
                "work_life_balance": "工作生活平衡有所改善"
            },
            created_at=personalized_plan.created_at + timedelta(days=7)
        )
        db.add(user_feedback)
        
        # 创建健康报告
        health_report = HealthReport(
            user_id=excel_client.id,
            plan_id=personalized_plan.id,
            report_type="periodic",
            report_data={
                "report_period": "2024年1月",
                "summary": "整体健康状况显著改善，HRV压力指数下降，睡眠质量提升",
                "objective_metrics": {
                    "hrv_stress_index": {
                        "baseline": "高压力状态",
                        "current": "中等压力状态",
                        "improvement": "压力指数下降30%",
                        "trend": "持续改善"
                    },
                    "sleep_quality": {
                        "baseline": "浅睡多，深度睡眠不足",
                        "current": "深度睡眠增加，睡眠效率提升",
                        "improvement": "睡眠效率提升25%",
                        "trend": "稳步改善"
                    }
                },
                "subjective_improvements": {
                    "energy_level": "日间疲劳明显缓解",
                    "sleep_quality": "入睡时间缩短，睡眠深度增加",
                    "mood": "工作压力感减轻，情绪状态改善"
                },
                "behavior_transformations": {
                    "stress_management": "学会压力管理技巧",
                    "sleep_schedule": "作息时间更加规律",
                    "work_life_balance": "工作生活平衡有所改善"
                },
                "service_value": "HRV压力监测和睡眠改善指导服务有效支持了健康改善",
                "recommendations": ["继续坚持当前方案", "增加压力管理培训", "定期HRV监测"]
            },
            objective_metrics={
                "hrv_stress_index": "中等压力状态",
                "sleep_efficiency": "75%",
                "heart_rate_variability": "正常范围"
            },
            subjective_improvements={
                "energy_level": "日间疲劳明显缓解",
                "sleep_quality": "入睡时间缩短，睡眠深度增加",
                "mood": "工作压力感减轻，情绪状态改善"
            },
            behavior_transformations={
                "stress_management": "学会压力管理技巧",
                "sleep_schedule": "作息时间更加规律",
                "work_life_balance": "工作生活平衡有所改善"
            },
            visualization_data={
                "charts": [
                    {"type": "line", "title": "HRV压力指数变化趋势", "data": "压力数据"},
                    {"type": "bar", "title": "睡眠质量改善", "data": "睡眠数据"}
                ]
            },
            created_at=personalized_plan.created_at + timedelta(days=30)
        )
        db.add(health_report)
        
        db.commit()
        
        print("✅ Excel案例演示数据创建成功")
        print(f"✅ 创建了Excel案例客户用户：excel_case_client")
        print(f"✅ 创建了1个音频记录（Excel案例）")
        print(f"✅ 创建了1个转写记录（Excel案例）")
        print(f"✅ 创建了1个健康简历（Excel案例）")
        print(f"✅ 创建了1个健康分析（Excel案例）")
        print(f"✅ 创建了2个健康需求")
        print(f"✅ 创建了2个解决方案模块（C1睡眠-交感型疲劳系统、C2代谢风险预警系统）")
        print(f"✅ 创建了1个个性化方案")
        print(f"✅ 创建了1个用户反馈")
        print(f"✅ 创建了1个健康报告")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建Excel案例演示数据失败：{str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 开始创建Excel案例演示数据...")
    success = create_excel_case_demo()
    if success:
        print("\n🎉 Excel案例演示数据创建完成！")
        print("\n📋 Excel案例用户信息：")
        print("Excel案例客户：excel_case_client / excel_case@example.com")
        print("\n📊 Excel案例特色：")
        print("  ✅ 42岁IT工程师真实案例")
        print("  ✅ BMI 25.9超重状况")
        print("  ✅ 工作压力大、睡眠质量下降")
        print("  ✅ C1睡眠-交感型疲劳系统")
        print("  ✅ C2代谢风险预警系统")
        print("  ✅ HRV压力监测服务")
        print("  ✅ 客户偏好：中高价位、非医疗语言数字反馈")
    else:
        print("\n❌ Excel案例演示数据创建失败")
