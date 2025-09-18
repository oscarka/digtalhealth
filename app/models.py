"""
数据模型定义
基于需求文档的九阶段处理流程设计
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default="client")  # client, health_manager, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AudioRecord(Base):
    """录音文件表"""
    __tablename__ = "audio_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    duration = Column(Float)  # 录音时长（秒）
    format = Column(String(10))  # mp3, wav, m4a等
    status = Column(String(20), default="uploaded")  # uploaded, processing, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    user = relationship("User")
    transcriptions = relationship("Transcription", back_populates="audio_record")
    analyses = relationship("HealthAnalysis", back_populates="audio_record")

class Transcription(Base):
    """转写文本表"""
    __tablename__ = "transcriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    audio_record_id = Column(Integer, ForeignKey("audio_records.id"), nullable=False)
    text = Column(Text, nullable=False)
    confidence = Column(Float)  # 转写置信度
    language = Column(String(10), default="zh-CN")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    audio_record = relationship("AudioRecord", back_populates="transcriptions")

class HealthProfile(Base):
    """健康简历表"""
    __tablename__ = "health_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    profile_data = Column(JSON)  # 存储结构化的健康信息
    narrative = Column(Text)  # 叙事式健康简历
    version = Column(Integer, default=1)  # 版本号，支持动态更新
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关联关系
    user = relationship("User")

class HealthAnalysis(Base):
    """健康需求分析表"""
    __tablename__ = "health_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    audio_record_id = Column(Integer, ForeignKey("audio_records.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stage = Column(Integer, nullable=False)  # 1-9阶段
    stage_name = Column(String(100), nullable=False)
    analysis_data = Column(JSON)  # 存储分析结果
    confidence_score = Column(Float)  # 置信度评分
    status = Column(String(20), default="processing")  # processing, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # 关联关系
    audio_record = relationship("AudioRecord", back_populates="analyses")
    user = relationship("User")

class HealthRequirement(Base):
    """健康需求表"""
    __tablename__ = "health_requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("health_analyses.id"), nullable=False)
    dimension = Column(String(50), nullable=False)  # 生物医学、心理、社会环境、制度政策、生命历程
    requirement_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    reasoning_chain = Column(Text)  # 逻辑推理链路
    confidence_score = Column(Float)
    priority_score = Column(Float)  # 优先级评分
    is_validated = Column(Boolean, default=False)
    validation_source = Column(String(200))  # 验证依据
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    analysis = relationship("HealthAnalysis")

class SolutionModule(Base):
    """解决方案模块表"""
    __tablename__ = "solution_modules"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("health_analyses.id"), nullable=False)
    module_name = Column(String(200), nullable=False)
    module_type = Column(String(100), nullable=False)
    description = Column(Text)
    requirements = Column(JSON)  # 关联的健康需求
    metrics = Column(JSON)  # 量化指标
    priority_score = Column(Float)  # 综合优先级评分
    disease_risk_score = Column(Float)  # 疾病风险等级
    improvement_score = Column(Float)  # 执行改善程度
    acceptance_score = Column(Float)  # 客户可接受度
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    analysis = relationship("HealthAnalysis")
    solutions = relationship("SolutionTree", back_populates="module")

class SolutionTree(Base):
    """树形解决方案表"""
    __tablename__ = "solution_trees"
    
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("solution_modules.id"), nullable=False)
    node_type = Column(String(20), nullable=False)  # root, branch, leaf
    node_name = Column(String(200), nullable=False)
    parent_id = Column(Integer, ForeignKey("solution_trees.id"))
    description = Column(Text)
    services = Column(JSON)  # 推荐的服务组合
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    module = relationship("SolutionModule", back_populates="solutions")
    parent = relationship("SolutionTree", remote_side=[id])
    children = relationship("SolutionTree")

class PersonalizedPlan(Base):
    """个性化方案表"""
    __tablename__ = "personalized_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_id = Column(Integer, ForeignKey("health_analyses.id"), nullable=False)
    plan_data = Column(JSON)  # 方案详细数据
    customer_preferences = Column(JSON)  # 客户偏好
    reasoning_logic = Column(Text)  # 综合落地推理逻辑
    status = Column(String(20), default="active")  # active, paused, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关联关系
    user = relationship("User")
    analysis = relationship("HealthAnalysis")
    feedbacks = relationship("UserFeedback", back_populates="plan")

class UserFeedback(Base):
    """用户反馈表"""
    __tablename__ = "user_feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("personalized_plans.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback_type = Column(String(50), nullable=False)  # wearable_data, questionnaire, medical_report
    feedback_data = Column(JSON)  # 反馈数据
    health_metrics = Column(JSON)  # 健康指标数据
    subjective_feelings = Column(JSON)  # 主观感受
    behavior_changes = Column(JSON)  # 行为变化
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    plan = relationship("PersonalizedPlan", back_populates="feedbacks")
    user = relationship("User")

class HealthReport(Base):
    """健康报告表"""
    __tablename__ = "health_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("personalized_plans.id"), nullable=False)
    report_type = Column(String(50), nullable=False)  # periodic, improvement, summary
    report_data = Column(JSON)  # 报告数据
    objective_metrics = Column(JSON)  # 客观健康指标
    subjective_improvements = Column(JSON)  # 主观身体感受
    behavior_transformations = Column(JSON)  # 行为习惯转变
    visualization_data = Column(JSON)  # 可视化数据
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    user = relationship("User")
    plan = relationship("PersonalizedPlan")

class SystemLog(Base):
    """系统日志表"""
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(Integer)
    details = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    user = relationship("User")
