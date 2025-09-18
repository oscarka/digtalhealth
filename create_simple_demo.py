"""
创建简化的演示数据
"""

import asyncio
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, AudioRecord, Transcription, HealthProfile, HealthAnalysis

# 创建所有表
Base.metadata.create_all(bind=engine)

def create_simple_demo():
    """创建简化的演示数据"""
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
        client_user = User(
            username="client001",
            email="client001@example.com",
            full_name="李小明",
            role="client",
            is_active=True
        )
        db.add(client_user)
        
        db.commit()
        db.refresh(client_user)
        
        # 创建音频记录
        audio_record = AudioRecord(
            user_id=client_user.id,
            filename="health_consultation_1.mp3",
            file_path="uploads/demo_audio_1.mp3",
            file_size=1024000,
            duration=120.5,
            format="mp3",
            status="completed",
            created_at=datetime.now() - timedelta(days=7)
        )
        db.add(audio_record)
        db.commit()
        db.refresh(audio_record)
        
        # 创建转写记录
        transcription = Transcription(
            audio_record_id=audio_record.id,
            text="医生您好，我最近总是感觉疲劳，晚上睡不好觉，白天工作也没精神。我今年35岁，在IT公司工作，经常加班到很晚。家里有高血压家族史，我父亲就是高血压患者。我想咨询一下我的情况是否需要去医院检查。",
            confidence=0.95,
            language="zh-CN",
            created_at=audio_record.created_at
        )
        db.add(transcription)
        db.commit()
        
        # 创建健康简历
        health_profile = HealthProfile(
            user_id=client_user.id,
            profile_data={
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
            narrative="李小明，35岁男性，IT工程师，有高血压家族史。最近出现疲劳和失眠症状，工作压力大，经常加班，缺乏运动，饮食不规律。",
            version=1,
            created_at=datetime.now() - timedelta(days=6)
        )
        db.add(health_profile)
        db.commit()
        
        # 创建健康分析
        health_analysis = HealthAnalysis(
            audio_record_id=audio_record.id,
            user_id=client_user.id,
            stage=9,
            stage_name="完整九阶段分析",
            analysis_data={
                "stage1": {
                    "stage": 1,
                    "stage_name": "多源数据采集与解析",
                    "core_information": {
                        "basic_info": {
                            "age": "35",
                            "gender": "男",
                            "occupation": "IT工程师"
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
                }
            },
            confidence_score=0.88,
            status="completed",
            created_at=audio_record.created_at + timedelta(minutes=5),
            completed_at=audio_record.created_at + timedelta(minutes=5)
        )
        db.add(health_analysis)
        db.commit()
        
        print("✅ 简化演示数据创建成功")
        print(f"✅ 创建了管理员用户：admin")
        print(f"✅ 创建了健康管理师：health_manager")
        print(f"✅ 创建了客户用户：client001")
        print(f"✅ 创建了1个音频记录")
        print(f"✅ 创建了1个转写记录")
        print(f"✅ 创建了1个健康简历")
        print(f"✅ 创建了1个健康分析")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建演示数据失败：{str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 开始创建简化演示数据...")
    success = create_simple_demo()
    if success:
        print("\n🎉 演示数据创建完成！")
        print("\n📋 演示用户信息：")
        print("管理员：admin / admin@healthsystem.com")
        print("健康管理师：health_manager / manager@healthsystem.com")
        print("客户：client001 / client001@example.com")
    else:
        print("\n❌ 演示数据创建失败")
