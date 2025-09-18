"""
AI服务模块
实现九阶段健康需求分析的核心AI功能
"""

import openai
import json
from typing import Dict, List, Any, Optional
from app.core.config import settings
from app.schemas import HealthDimension, AnalysisStage

class AIService:
    """AI分析服务"""
    
    def __init__(self):
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
    
    async def transcribe_audio(self, audio_file_path: str) -> Dict[str, Any]:
        """
        第一阶段：音频转写
        使用Whisper进行高精度语音转文本
        """
        try:
            if not self.client:
                # 模拟转写结果（用于演示）
                return {
                    "text": "医生您好，我最近总是感觉疲劳，晚上睡不好觉，白天工作也没精神。我今年35岁，在IT公司工作，经常加班到很晚。家里有高血压家族史，我父亲就是高血压患者。我想咨询一下我的情况是否需要去医院检查。",
                    "confidence": 0.95,
                    "language": "zh-CN",
                    "segments": [
                        {"start": 0.0, "end": 5.2, "text": "医生您好，我最近总是感觉疲劳"},
                        {"start": 5.2, "end": 8.1, "text": "晚上睡不好觉，白天工作也没精神"},
                        {"start": 8.1, "end": 12.5, "text": "我今年35岁，在IT公司工作，经常加班到很晚"},
                        {"start": 12.5, "end": 16.8, "text": "家里有高血压家族史，我父亲就是高血压患者"},
                        {"start": 16.8, "end": 20.0, "text": "我想咨询一下我的情况是否需要去医院检查"}
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
        第一阶段：核心信息提取
        从转写文本中提取结构化健康信息
        """
        prompt = f"""
        请从以下健康咨询录音转写文本中提取核心信息，并按照指定格式输出：

        转写文本：{transcript_text}

        请提取以下信息：
        1. 会员及家属基础信息（姓名、年龄、性别、健康关联关系）
        2. 人事物关联信息（个体、健康事件、相关物品）
        3. 主要症状（部位、性质、程度）
        4. 背景信息（既往病史、手术史、过敏史、生活习惯、工作性质）

        输出格式为JSON：
        {{
            "basic_info": {{
                "age": "年龄",
                "gender": "性别",
                "occupation": "职业",
                "family_history": ["家族病史"]
            }},
            "symptoms": [
                {{
                    "description": "症状描述",
                    "location": "部位",
                    "severity": "程度",
                    "duration": "持续时间"
                }}
            ],
            "background": {{
                "medical_history": ["既往病史"],
                "surgical_history": ["手术史"],
                "allergies": ["过敏史"],
                "lifestyle": {{
                    "smoking": "吸烟情况",
                    "drinking": "饮酒情况",
                    "exercise": "运动频率",
                    "diet": "饮食习惯"
                }}
            }},
            "medications": ["正在服用的药物及剂量"]
        }}
        """
        
        try:
            if not self.client:
                # 模拟提取结果
                return {
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
                }
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"信息提取失败: {str(e)}")
    
    async def multi_dimensional_assessment(self, core_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        第二阶段：多维健康需求评估
        从五个维度进行发散性评估
        """
        prompt = f"""
        基于以下核心健康信息，从五个维度进行健康需求评估：

        核心信息：{json.dumps(core_info, ensure_ascii=False, indent=2)}

        请从以下五个维度进行评估：
        1. 生物医学维度：生理、病理、药理等
        2. 心理维度：情绪、压力、认知等
        3. 社会环境维度：居住环境、职业特点、社交支持等
        4. 制度政策维度：医保政策、就医流程、公共卫生服务等
        5. 生命历程维度：年龄、性别、生命周期阶段等

        输出格式为JSON：
        {{
            "dimensions": {{
                "biomedical": [
                    {{
                        "requirement": "需求描述",
                        "reasoning": "推理链路",
                        "confidence": 0.95
                    }}
                ],
                "psychological": [...],
                "social_environment": [...],
                "institutional_policy": [...],
                "life_course": [...]
            }}
        }}
        """
        
        try:
            if not self.client:
                # 模拟评估结果
                return {
                    "dimensions": {
                        "biomedical": [
                            {
                                "requirement": "血压监测和心血管风险评估",
                                "reasoning": "家族高血压史 + 工作压力 + 缺乏运动 → 高血压风险增加",
                                "confidence": 0.85
                            },
                            {
                                "requirement": "睡眠质量评估和改善",
                                "reasoning": "失眠症状 + 工作压力 → 睡眠质量下降",
                                "confidence": 0.90
                            }
                        ],
                        "psychological": [
                            {
                                "requirement": "压力管理和心理支持",
                                "reasoning": "IT工作996 + 疲劳症状 → 工作压力过大",
                                "confidence": 0.80
                            }
                        ],
                        "social_environment": [
                            {
                                "requirement": "工作生活平衡调整",
                                "reasoning": "IT行业加班文化 → 生活作息不规律",
                                "confidence": 0.75
                            }
                        ],
                        "institutional_policy": [
                            {
                                "requirement": "定期体检和健康管理服务",
                                "reasoning": "35岁 + 家族史 → 需要定期健康监测",
                                "confidence": 0.85
                            }
                        ],
                        "life_course": [
                            {
                                "requirement": "中年健康管理重点",
                                "reasoning": "35岁男性 + 工作压力期 → 心血管疾病预防关键期",
                                "confidence": 0.80
                            }
                        ]
                    }
                }
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"多维评估失败: {str(e)}")
    
    async def validate_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        第三阶段：需求分析结果验证
        逐条验证健康需求并给出置信度评分
        """
        prompt = f"""
        请对以下健康需求进行逐条验证，基于医学知识和社会科学理论：

        健康需求：{json.dumps(requirements, ensure_ascii=False, indent=2)}

        验证要求：
        1. 医学领域的推理验证必须基于权威的医学知识
        2. 非医学领域的推理逻辑验证应符合社会科学、心理学等领域的公认理论
        3. 充分考虑个体差异的影响

        输出格式为JSON：
        {{
            "validated_requirements": [
                {{
                    "requirement": "需求描述",
                    "validation_result": "验证结果",
                    "confidence_score": 0.95,
                    "validation_source": "验证依据",
                    "individual_factors": ["个体差异因素"]
                }}
            ]
        }}
        """
        
        try:
            if not self.client:
                # 模拟验证结果
                validated_requirements = []
                for dimension, reqs in requirements.get("dimensions", {}).items():
                    for req in reqs:
                        validated_requirements.append({
                            "requirement": req["requirement"],
                            "validation_result": "验证通过",
                            "confidence_score": req["confidence"],
                            "validation_source": "医学指南和临床研究",
                            "individual_factors": ["家族史", "工作压力", "年龄因素"]
                        })
                
                return {"validated_requirements": validated_requirements}
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"需求验证失败: {str(e)}")
    
    async def create_solution_modules(self, validated_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        第四阶段：整合需求形成系统性问题解决框架
        """
        prompt = f"""
        基于验证后的健康需求，创建系统性问题解决框架（模块）：

        验证后的需求：{json.dumps(validated_requirements, ensure_ascii=False, indent=2)}

        要求：
        1. 将关联的需求整合为独立的模块
        2. 每个模块保持高度独立性
        3. 模块的核心作用机理和评估指标必须是可量化的

        输出格式为JSON：
        {{
            "modules": [
                {{
                    "module_name": "模块名称",
                    "module_type": "模块类型",
                    "description": "模块描述",
                    "requirements": ["关联需求ID"],
                    "metrics": {{
                        "key_indicators": ["关键指标"],
                        "measurement_methods": ["测量方法"],
                        "target_values": ["目标值"]
                    }}
                }}
            ]
        }}
        """
        
        try:
            if not self.client:
                # 模拟模块创建结果
                return {
                    "modules": [
                        {
                            "module_name": "心血管健康管理模块",
                            "module_type": "疾病预防",
                            "description": "针对高血压家族史和工作压力的心血管疾病预防",
                            "requirements": ["血压监测", "压力管理"],
                            "metrics": {
                                "key_indicators": ["血压", "心率", "胆固醇", "血糖"],
                                "measurement_methods": ["血压计", "心电图", "血液检查"],
                                "target_values": ["<140/90mmHg", "60-100bpm", "<5.2mmol/L", "<6.1mmol/L"]
                            }
                        },
                        {
                            "module_name": "睡眠质量改善模块",
                            "module_type": "生活方式",
                            "description": "改善失眠症状，提高睡眠质量",
                            "requirements": ["睡眠评估", "作息调整"],
                            "metrics": {
                                "key_indicators": ["入睡时间", "睡眠时长", "睡眠效率", "日间疲劳"],
                                "measurement_methods": ["睡眠日记", "可穿戴设备", "疲劳量表"],
                                "target_values": ["<30分钟", "7-9小时", ">85%", "轻度疲劳"]
                            }
                        }
                    ]
                }
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"模块创建失败: {str(e)}")
    
    async def rank_modules(self, modules: Dict[str, Any]) -> Dict[str, Any]:
        """
        第五阶段：系统性问题框架排序
        基于多维度评分模型进行优先级排序
        """
        prompt = f"""
        对以下解决方案模块进行优先级排序：

        模块列表：{json.dumps(modules, ensure_ascii=False, indent=2)}

        评分标准（加权模型）：
        1. 疾病风险等级（权重40%）：健康风险的严重性和紧迫性
        2. 执行改善程度（权重30%）：干预后可能获得的健康改善效果
        3. 客户可接受度（权重30%）：客户采纳相关方案的意愿

        输出格式为JSON：
        {{
            "ranked_modules": [
                {{
                    "module_name": "模块名称",
                    "disease_risk_score": 0.85,
                    "improvement_score": 0.75,
                    "acceptance_score": 0.80,
                    "priority_score": 0.80,
                    "rank": 1
                }}
            ]
        }}
        """
        
        try:
            if not self.client:
                # 模拟排序结果
                ranked_modules = []
                for i, module in enumerate(modules.get("modules", [])):
                    # 模拟评分
                    disease_risk_score = 0.8 + (i * 0.1)
                    improvement_score = 0.7 + (i * 0.1)
                    acceptance_score = 0.75 + (i * 0.05)
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
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"模块排序失败: {str(e)}")
    
    async def create_solution_tree(self, module: Dict[str, Any]) -> Dict[str, Any]:
        """
        第六阶段：树形可行方案构建
        为每个模块构建树形解决方案
        """
        prompt = f"""
        为以下解决方案模块构建树形解决方案：

        模块信息：{json.dumps(module, ensure_ascii=False, indent=2)}

        要求：
        1. 构建树形结构（根节点-分支节点-叶子节点）
        2. 体现问题解决的动态性和阶段性
        3. 在节点上推荐多学科的、可量化的干预服务

        输出格式为JSON：
        {{
            "tree_structure": {{
                "root": {{
                    "node_name": "根节点名称",
                    "description": "核心问题描述"
                }},
                "branches": [
                    {{
                        "node_name": "分支节点名称",
                        "description": "干预阶段描述",
                        "services": ["推荐服务"]
                    }}
                ],
                "leaves": [
                    {{
                        "node_name": "叶子节点名称",
                        "description": "具体行动建议",
                        "services": ["具体服务"],
                        "metrics": ["评估指标"]
                    }}
                ]
            }}
        }}
        """
        
        try:
            if not self.client:
                # 模拟树形结构
                return {
                    "tree_structure": {
                        "root": {
                            "node_name": f"{module['module_name']}核心问题",
                            "description": module["description"]
                        },
                        "branches": [
                            {
                                "node_name": "评估诊断阶段",
                                "description": "全面评估当前健康状况",
                                "services": ["健康体检", "专业评估", "风险评估"]
                            },
                            {
                                "node_name": "干预治疗阶段",
                                "description": "实施个性化干预方案",
                                "services": ["生活方式指导", "药物治疗", "心理支持"]
                            },
                            {
                                "node_name": "监测调整阶段",
                                "description": "持续监测和方案调整",
                                "services": ["定期随访", "效果评估", "方案优化"]
                            }
                        ],
                        "leaves": [
                            {
                                "node_name": "血压监测",
                                "description": "定期测量血压，记录变化趋势",
                                "services": ["家庭血压计", "血压记录表", "专业解读"],
                                "metrics": ["收缩压", "舒张压", "心率"]
                            },
                            {
                                "node_name": "生活方式调整",
                                "description": "改善饮食、运动、作息习惯",
                                "services": ["营养指导", "运动计划", "作息调整"],
                                "metrics": ["BMI", "运动时长", "睡眠质量"]
                            }
                        ]
                    }
                }
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"树形方案构建失败: {str(e)}")
    
    async def create_personalized_plan(self, solution_trees: List[Dict[str, Any]], 
                                     customer_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        第七阶段：个性化可实施方案
        结合公司服务元素和客户偏好生成最终方案
        """
        prompt = f"""
        基于以下树形解决方案和客户偏好，生成个性化可实施方案：

        解决方案树：{json.dumps(solution_trees, ensure_ascii=False, indent=2)}
        客户偏好：{json.dumps(customer_preferences, ensure_ascii=False, indent=2)}

        要求：
        1. 匹配公司现有的产品服务元素库
        2. 充分考虑客户的经济性、便利性、个人偏好
        3. 提供清晰的综合落地推理逻辑

        输出格式为JSON：
        {{
            "personalized_plan": {{
                "plan_summary": "方案概述",
                "modules": [
                    {{
                        "module_name": "模块名称",
                        "priority": 1,
                        "services": [
                            {{
                                "service_name": "服务名称",
                                "service_type": "服务类型",
                                "frequency": "服务频率",
                                "duration": "服务时长",
                                "cost": "预估费用",
                                "convenience": "便利性评分"
                            }}
                        ]
                    }}
                ],
                "reasoning_logic": "综合落地推理逻辑",
                "expected_outcomes": ["预期效果"],
                "monitoring_plan": ["监测计划"]
            }}
        }}
        """
        
        try:
            if not self.client:
                # 模拟个性化方案
                return {
                    "personalized_plan": {
                        "plan_summary": "基于您的健康状况和偏好，我们为您制定了综合健康管理方案",
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
                                    },
                                    {
                                        "service_name": "营养师在线咨询",
                                        "service_type": "咨询服务",
                                        "frequency": "每周1次",
                                        "duration": "3个月",
                                        "cost": "800元",
                                        "convenience": "中"
                                    }
                                ]
                            }
                        ],
                        "reasoning_logic": "基于您的IT工作背景、家族高血压史和预算考虑，优先推荐家庭监测设备，配合专业营养指导，既经济又便利",
                        "expected_outcomes": ["血压稳定", "睡眠改善", "疲劳缓解"],
                        "monitoring_plan": ["每周血压记录", "每月健康评估", "每季度方案调整"]
                    }
                }
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"个性化方案生成失败: {str(e)}")
    
    async def adjust_plan_dynamically(self, current_plan: Dict[str, Any], 
                                   feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        第八阶段：数字人管理方案的动态调整
        基于用户反馈调整健康管理方案
        """
        prompt = f"""
        基于用户反馈数据，对当前健康管理方案进行动态调整：

        当前方案：{json.dumps(current_plan, ensure_ascii=False, indent=2)}
        用户反馈：{json.dumps(feedback_data, ensure_ascii=False, indent=2)}

        要求：
        1. 分析反馈数据中的关键变化
        2. 识别需要调整的模块和服务
        3. 提供调整理由和预期效果

        输出格式为JSON：
        {{
            "adjusted_plan": {{
                "adjustment_summary": "调整概述",
                "changes": [
                    {{
                        "module": "模块名称",
                        "change_type": "调整类型",
                        "change_description": "调整描述",
                        "reason": "调整理由",
                        "expected_effect": "预期效果"
                    }}
                ],
                "monitoring_focus": ["重点关注指标"],
                "next_review_date": "下次评估日期"
            }}
        }}
        """
        
        try:
            if not self.client:
                # 模拟动态调整
                return {
                    "adjusted_plan": {
                        "adjustment_summary": "根据您的血压监测数据，建议调整运动强度和营养方案",
                        "changes": [
                            {
                                "module": "心血管健康管理",
                                "change_type": "服务调整",
                                "change_description": "增加有氧运动频率，调整饮食结构",
                                "reason": "血压数据显示需要更积极的干预",
                                "expected_effect": "血压进一步下降，心血管健康改善"
                            }
                        ],
                        "monitoring_focus": ["血压变化", "运动耐受性", "营养摄入"],
                        "next_review_date": "2024-02-15"
                    }
                }
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"方案动态调整失败: {str(e)}")
    
    async def generate_health_report(self, plan_data: Dict[str, Any], 
                                   feedback_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        第九阶段：定期反馈报告
        生成多维度健康改善报告
        """
        prompt = f"""
        基于健康管理方案和用户反馈历史，生成多维度健康改善报告：

        方案数据：{json.dumps(plan_data, ensure_ascii=False, indent=2)}
        反馈历史：{json.dumps(feedback_history, ensure_ascii=False, indent=2)}

        要求：
        1. 从三个维度展示健康状况改善：客观指标、主观感受、行为转变
        2. 提供可视化数据支持
        3. 关联具体服务功能的价值

        输出格式为JSON：
        {{
            "health_report": {{
                "report_period": "报告周期",
                "summary": "总体改善情况",
                "objective_metrics": {{
                    "blood_pressure": {{
                        "baseline": "基线值",
                        "current": "当前值",
                        "improvement": "改善幅度",
                        "trend": "变化趋势"
                    }}
                }},
                "subjective_improvements": {{
                    "energy_level": "精力水平改善",
                    "sleep_quality": "睡眠质量改善",
                    "mood": "情绪状态改善"
                }},
                "behavior_transformations": {{
                    "exercise_frequency": "运动频率变化",
                    "diet_habits": "饮食习惯变化",
                    "sleep_schedule": "作息规律变化"
                }},
                "service_value": "服务价值体现",
                "recommendations": ["后续建议"]
            }}
        }}
        """
        
        try:
            if not self.client:
                # 模拟健康报告
                return {
                    "health_report": {
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
                    }
                }
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            raise Exception(f"健康报告生成失败: {str(e)}")
