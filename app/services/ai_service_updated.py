
"""
基于Excel案例数据的AI服务更新
"""

import openai
import json
from typing import Dict, List, Any, Optional
from app.core.config import settings
from app.schemas import HealthDimension, AnalysisStage

class AIService:
    """AI分析服务 - 基于Excel案例数据"""
    
    def __init__(self):
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        
        # Excel案例数据
        self.case_data = {
  "basic_info": {
    "age": "42",
    "gender": "男",
    "occupation": "IT行业",
    "education": "本科学历",
    "marital_status": "已婚有一子",
    "height": "178cm",
    "weight": "82kg",
    "bmi": "25.9"
  },
  "symptoms": [
    "疲劳感增加",
    "睡眠质量下降",
    "工作压力大"
  ],
  "health_modules": [
    {
      "name": "C1 睡眠-交感型疲劳系统",
      "description": "涉及睡眠紊乱、压力引发的交感激活、生理恢复障碍等问题，常表现为疲劳、浅睡、早醒、白天无精打采等",
      "reasoning_chains": [
        "职业压力与冠心病死亡率关联分析 → 长期高压力职业者心血管事件风险↑40%",
        "长期压力 → 偏头痛或紧张性头痛发作频率↑（神经系统功能紊乱）",
        "长期压力 + 睡眠质量下降 → 免疫功能抑制（T细胞活性↓）→ 慢性炎症↑"
      ],
      "validation_data": [
        "心率变异性 HRV、皮质醇节律、ASCVD 风险评分",
        "偏头痛频率记录、自主神经测试（如 pupil size, 皮肤电）",
        "T细胞功能指标（如 CD4+/CD8+）、CRP、IL-6 水平"
      ],
      "customer_preferences": [
        "💰 中高价位（500–1500元）；偏好非医疗语言的数字反馈服务（如：压力/节律追踪）",
        "💰 中价位（300–800元）；愿尝试物理缓解工具（如热敷/脑放松仪）与自助评估服务",
        "💰 中高价位（600–1200元）；可接受行为调节建议 + 专业解释反馈，但需非侵入式检测"
      ]
    },
    {
      "name": "C2 代谢风险预警系统",
      "description": "关注因 BMI 超标、久坐、激素紊乱等引起的胰岛素抵抗、脂肪肝、糖尿病前期等代谢异常趋势",
      "reasoning_chains": [
        "疲劳 + 睡眠障碍 → 血糖检测（空腹血糖≥6.1）→ 糖调节受损",
        "超重（BMI 25.9）→ 腹腔脂肪堆积 → 胰岛素抵抗风险↑"
      ],
      "validation_data": [
        "空腹血糖、餐后2小时血糖、胰岛素、HbA1c",
        "腰围、体脂率、内脏脂肪评分、瘦素/饥饿素水平"
      ],
      "customer_preferences": [
        "💰 中高价位（500–1500元）；偏好数字反馈+非诊断化语言",
        "💰 中等价位（300–800元）；偏好轻量级干预，如饮食打卡、减脂体验营"
      ]
    }
  ],
  "multi_disciplinary_analysis": {
    "基础医学类": [
      "解剖学：研究人体器官、组织的结构与位置关系",
      "生理学：探索人体正常生理功能机制",
      "病理学：研究疾病发生发展规律"
    ],
    "临床医学类": [
      "内科学：心血管疾病、内分泌疾病诊断治疗",
      "外科学：手术治疗相关疾病",
      "神经病学：神经系统疾病诊断治疗"
    ],
    "心理学类": [
      "健康心理学：心理因素对健康的影响",
      "临床心理学：心理障碍的诊断治疗",
      "行为医学：行为因素与疾病关系"
    ]
  },
  "multi_dimensional_analysis": {
    "社会环境维度": [
      "家庭角色：家庭主要劳动力",
      "社会支持度：亲属探视频率、社区服务利用度",
      "经济压力：医疗支出占比、医保类型"
    ],
    "环境维度": [
      "居住条件：是否有无障碍设施",
      "卫生条件：居住环境卫生状况",
      "职业暴露风险：粉尘/化学物质接触史"
    ],
    "制度政策维度": [
      "医保政策：慢性病用药报销匹配",
      "公共卫生服务：社区健康管理服务",
      "职业健康保护：劳动保护政策"
    ],
    "生命历程维度": [
      "年龄阶段：42岁中年期健康管理重点",
      "性别因素：男性健康风险特点",
      "生命周期：工作-家庭平衡期"
    ]
  }
}
    
    async def transcribe_audio(self, audio_file_path: str) -> Dict[str, Any]:
        """
        第一阶段：音频转写 - 基于Excel案例
        """
        try:
            if not self.client:
                # 基于Excel案例的转写结果
                return {
                    "text": "医生您好，我是一名42岁的IT工程师，已婚有一个孩子。最近总是感觉疲劳，晚上睡不好觉，白天工作也没精神。工作压力比较大，经常需要加班。我想咨询一下我的情况是否需要去医院检查。我的身高是178cm，体重82kg。",
                    "confidence": 0.95,
                    "language": "zh-CN",
                    "segments": [
                        {"start": 0.0, "end": 5.2, "text": "医生您好，我是一名42岁的IT工程师，已婚有一个孩子"},
                        {"start": 5.2, "end": 8.1, "text": "最近总是感觉疲劳，晚上睡不好觉，白天工作也没精神"},
                        {"start": 8.1, "end": 12.5, "text": "工作压力比较大，经常需要加班"},
                        {"start": 12.5, "end": 16.8, "text": "我想咨询一下我的情况是否需要去医院检查"},
                        {"start": 16.8, "end": 20.0, "text": "我的身高是178cm，体重82kg"}
                    ]
                }
            
            # 实际使用OpenAI Whisper API
            with open(audio_file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json"
                )
            
            return {
                "text": transcript.text,
                "confidence": getattr(transcript, 'confidence', 0.95),
                "language": transcript.language,
                "segments": getattr(transcript, 'segments', [])
            }
        except Exception as e:
            raise Exception(f"音频转写失败: {str(e)}")
    
    async def extract_core_information(self, transcript_text: str) -> Dict[str, Any]:
        """
        第一阶段：核心信息提取 - 基于Excel案例
        """
        # 基于Excel案例的核心信息
        return {
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
        }
    
    async def multi_dimensional_assessment(self, core_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        第二阶段：多维健康需求评估 - 基于Excel案例
        """
        return {
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
                    },
                    {
                        "requirement": "神经系统功能评估",
                        "reasoning": "长期压力 → 偏头痛或紧张性头痛发作频率↑（神经系统功能紊乱）",
                        "confidence": 0.80
                    }
                ],
                "psychological": [
                    {
                        "requirement": "压力管理和心理支持",
                        "reasoning": "IT工作996 + 疲劳症状 → 工作压力过大",
                        "confidence": 0.85
                    },
                    {
                        "requirement": "睡眠质量改善",
                        "reasoning": "睡眠质量下降 + 工作压力 → 睡眠障碍风险增加",
                        "confidence": 0.90
                    }
                ],
                "social_environment": [
                    {
                        "requirement": "工作生活平衡调整",
                        "reasoning": "IT行业加班文化 → 生活作息不规律",
                        "confidence": 0.80
                    },
                    {
                        "requirement": "家庭支持系统优化",
                        "reasoning": "已婚有一子 + 工作压力 → 家庭关系压力增加",
                        "confidence": 0.75
                    }
                ],
                "institutional_policy": [
                    {
                        "requirement": "职业健康保护服务",
                        "reasoning": "IT行业 + 长期加班 → 职业健康风险增加",
                        "confidence": 0.80
                    },
                    {
                        "requirement": "医保政策匹配",
                        "reasoning": "慢性病风险 + 工作压力 → 需要医保支持",
                        "confidence": 0.75
                    }
                ],
                "life_course": [
                    {
                        "requirement": "中年健康管理重点",
                        "reasoning": "42岁男性 + 工作压力期 → 心血管疾病预防关键期",
                        "confidence": 0.85
                    },
                    {
                        "requirement": "家庭责任期健康管理",
                        "reasoning": "已婚有一子 + 工作压力 → 家庭健康管理需求增加",
                        "confidence": 0.80
                    }
                ]
            }
        }
    
    async def validate_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        第三阶段：需求分析结果验证 - 基于Excel案例
        """
        validated_requirements = []
        
        # 生物医学维度验证
        biomedical_reqs = requirements.get("dimensions", {}).get("biomedical", [])
        for req in biomedical_reqs:
            validated_requirements.append({
                "requirement": req["requirement"],
                "validation_result": "验证通过",
                "confidence_score": req["confidence"],
                "validation_source": "医学指南和临床研究",
                "individual_factors": ["IT行业工作压力", "BMI 25.9超重", "42岁中年期"]
            })
        
        # 其他维度验证
        for dimension, reqs in requirements.get("dimensions", {}).items():
            if dimension != "biomedical":
                for req in reqs:
                    validated_requirements.append({
                        "requirement": req["requirement"],
                        "validation_result": "验证通过",
                        "confidence_score": req["confidence"],
                        "validation_source": "社会科学理论和心理学研究",
                        "individual_factors": ["已婚有一子", "IT行业", "工作压力"]
                    })
        
        return {"validated_requirements": validated_requirements}
    
    async def create_solution_modules(self, validated_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        第四阶段：整合需求形成系统性问题解决框架 - 基于Excel案例
        """
        return {
            "modules": [
                {
                    "module_name": "C1 睡眠-交感型疲劳系统",
                    "module_type": "综合健康管理",
                    "description": "涉及睡眠紊乱、压力引发的交感激活、生理恢复障碍等问题，常表现为疲劳、浅睡、早醒、白天无精打采等",
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
    
    async def rank_modules(self, modules: Dict[str, Any]) -> Dict[str, Any]:
        """
        第五阶段：系统性问题框架排序 - 基于Excel案例
        """
        ranked_modules = []
        
        for i, module in enumerate(modules.get("modules", [])):
            # 基于Excel案例的评分
            if "睡眠-交感型疲劳" in module["module_name"]:
                disease_risk_score = 0.85  # 心血管风险高
                improvement_score = 0.80  # 改善效果明显
                acceptance_score = 0.75   # 客户接受度中等
            elif "代谢风险预警" in module["module_name"]:
                disease_risk_score = 0.80  # 代谢风险中等
                improvement_score = 0.75  # 改善效果中等
                acceptance_score = 0.85   # 客户接受度高
            
            priority_score = (disease_risk_score * 0.4 + improvement_score * 0.3 + acceptance_score * 0.3)
            
            ranked_modules.append({
                "module_name": module["module_name"],
                "disease_risk_score": disease_risk_score,
                "improvement_score": improvement_score,
                "acceptance_score": acceptance_score,
                "priority_score": priority_score,
                "rank": i + 1
            })
        
        # 按优先级排序
        ranked_modules.sort(key=lambda x: x["priority_score"], reverse=True)
        for i, module in enumerate(ranked_modules):
            module["rank"] = i + 1
        
        return {"ranked_modules": ranked_modules}
    
    async def create_solution_tree(self, module: Dict[str, Any]) -> Dict[str, Any]:
        """
        第六阶段：树形可行方案构建 - 基于Excel案例
        """
        if "睡眠-交感型疲劳" in module["module_name"]:
            return {
                "tree_structure": {
                    "root": {
                        "node_name": "睡眠-交感型疲劳系统核心问题",
                        "description": "职业压力引发的睡眠障碍和疲劳问题"
                    },
                    "branches": [
                        {
                            "node_name": "压力评估阶段",
                            "description": "全面评估工作压力和心理状态",
                            "services": ["压力评估量表", "HRV监测", "心理状态评估"]
                        },
                        {
                            "node_name": "睡眠改善阶段",
                            "description": "改善睡眠质量和作息规律",
                            "services": ["睡眠监测", "作息调整指导", "睡眠环境优化"]
                        },
                        {
                            "node_name": "压力管理阶段",
                            "description": "学习压力管理技巧",
                            "services": ["压力管理培训", "放松技巧指导", "心理支持"]
                        }
                    ],
                    "leaves": [
                        {
                            "node_name": "HRV监测",
                            "description": "通过心率变异性监测压力水平",
                            "services": ["可穿戴设备", "HRV数据分析", "压力报告"],
                            "metrics": ["HRV数值", "压力指数", "恢复能力"]
                        },
                        {
                            "node_name": "睡眠质量改善",
                            "description": "改善睡眠质量和深度",
                            "services": ["睡眠监测设备", "睡眠指导", "环境优化建议"],
                            "metrics": ["睡眠时长", "深度睡眠比例", "睡眠效率"]
                        }
                    ]
                }
            }
        else:
            return {
                "tree_structure": {
                    "root": {
                        "node_name": "代谢风险预警系统核心问题",
                        "description": "BMI超标和代谢异常风险"
                    },
                    "branches": [
                        {
                            "node_name": "代谢评估阶段",
                            "description": "全面评估代谢功能和风险",
                            "services": ["血糖检测", "胰岛素检测", "体脂率测量"]
                        },
                        {
                            "node_name": "生活方式调整阶段",
                            "description": "调整饮食和运动习惯",
                            "services": ["营养指导", "运动计划", "生活方式咨询"]
                        }
                    ],
                    "leaves": [
                        {
                            "node_name": "血糖监测",
                            "description": "定期监测血糖水平",
                            "services": ["血糖仪", "血糖记录", "数据分析"],
                            "metrics": ["空腹血糖", "餐后血糖", "HbA1c"]
                        }
                    ]
                }
            }
    
    async def create_personalized_plan(self, solution_trees: List[Dict[str, Any]], 
                                     customer_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        第七阶段：个性化可实施方案 - 基于Excel案例
        """
        return {
            "personalized_plan": {
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
            }
        }
    
    async def adjust_plan_dynamically(self, current_plan: Dict[str, Any], 
                                   feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        第八阶段：数字人管理方案的动态调整 - 基于Excel案例
        """
        return {
            "adjusted_plan": {
                "adjustment_summary": "根据您的HRV监测数据，建议增加压力管理培训和调整睡眠方案",
                "changes": [
                    {
                        "module": "C1 睡眠-交感型疲劳系统",
                        "change_type": "服务调整",
                        "change_description": "增加压力管理培训，调整睡眠监测频率",
                        "reason": "HRV数据显示压力水平仍然较高，需要更积极的干预",
                        "expected_effect": "压力水平进一步下降，睡眠质量持续改善"
                    }
                ],
                "monitoring_focus": ["HRV变化趋势", "睡眠质量改善", "压力管理效果"],
                "next_review_date": "2024-02-15"
            }
        }
    
    async def generate_health_report(self, plan_data: Dict[str, Any], 
                                   feedback_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        第九阶段：定期反馈报告 - 基于Excel案例
        """
        return {
            "health_report": {
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
            }
        }
