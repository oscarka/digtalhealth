"""
Pydantic数据模式定义
用于API请求和响应的数据验证
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    """用户角色枚举"""
    CLIENT = "client"
    HEALTH_MANAGER = "health_manager"
    ADMIN = "admin"

class AnalysisStage(str, Enum):
    """分析阶段枚举"""
    STAGE_1 = "多源数据采集与解析"
    STAGE_2 = "多维健康需求评估"
    STAGE_3 = "需求分析结果验证"
    STAGE_4 = "整合需求形成框架"
    STAGE_5 = "框架排序"
    STAGE_6 = "树形方案构建"
    STAGE_7 = "个性化方案"
    STAGE_8 = "动态调整"
    STAGE_9 = "定期反馈报告"

class HealthDimension(str, Enum):
    """健康维度枚举"""
    BIOMEDICAL = "生物医学"
    PSYCHOLOGICAL = "心理"
    SOCIAL_ENVIRONMENT = "社会环境"
    INSTITUTIONAL_POLICY = "制度政策"
    LIFE_COURSE = "生命历程"

# 用户相关模式
class UserBase(BaseModel):
    """用户基础模式"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    full_name: Optional[str] = None
    role: UserRole = UserRole.CLIENT

class UserCreate(UserBase):
    """创建用户模式"""
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    """更新用户模式"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    """用户响应模式"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 音频相关模式
class AudioRecordCreate(BaseModel):
    """创建录音记录模式"""
    filename: str
    duration: Optional[float] = None
    format: Optional[str] = None

class AudioRecordResponse(BaseModel):
    """录音记录响应模式"""
    id: int
    user_id: int
    filename: str
    file_path: str
    file_size: Optional[int] = None
    duration: Optional[float] = None
    format: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# 转写相关模式
class TranscriptionResponse(BaseModel):
    """转写响应模式"""
    id: int
    audio_record_id: int
    text: str
    confidence: Optional[float] = None
    language: str
    created_at: datetime

    class Config:
        from_attributes = True

# 健康简历相关模式
class HealthProfileBase(BaseModel):
    """健康简历基础模式"""
    profile_data: Dict[str, Any]
    narrative: Optional[str] = None

class HealthProfileCreate(HealthProfileBase):
    """创建健康简历模式"""
    pass

class HealthProfileUpdate(BaseModel):
    """更新健康简历模式"""
    profile_data: Optional[Dict[str, Any]] = None
    narrative: Optional[str] = None

class HealthProfileResponse(HealthProfileBase):
    """健康简历响应模式"""
    id: int
    user_id: int
    version: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 健康分析相关模式
class HealthAnalysisResponse(BaseModel):
    """健康分析响应模式"""
    id: int
    audio_record_id: int
    user_id: int
    stage: int
    stage_name: str
    analysis_data: Dict[str, Any]
    confidence_score: Optional[float] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 健康需求相关模式
class HealthRequirementBase(BaseModel):
    """健康需求基础模式"""
    dimension: HealthDimension
    requirement_type: str
    description: str
    reasoning_chain: Optional[str] = None
    confidence_score: Optional[float] = None
    priority_score: Optional[float] = None

class HealthRequirementCreate(HealthRequirementBase):
    """创建健康需求模式"""
    analysis_id: int

class HealthRequirementResponse(HealthRequirementBase):
    """健康需求响应模式"""
    id: int
    analysis_id: int
    is_validated: bool
    validation_source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# 解决方案模块相关模式
class SolutionModuleBase(BaseModel):
    """解决方案模块基础模式"""
    module_name: str
    module_type: str
    description: Optional[str] = None
    requirements: List[int] = []
    metrics: Dict[str, Any] = {}
    priority_score: Optional[float] = None
    disease_risk_score: Optional[float] = None
    improvement_score: Optional[float] = None
    acceptance_score: Optional[float] = None

class SolutionModuleCreate(SolutionModuleBase):
    """创建解决方案模块模式"""
    analysis_id: int

class SolutionModuleResponse(SolutionModuleBase):
    """解决方案模块响应模式"""
    id: int
    analysis_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# 树形解决方案相关模式
class SolutionTreeNode(BaseModel):
    """树形解决方案节点模式"""
    id: int
    node_type: str
    node_name: str
    parent_id: Optional[int] = None
    description: Optional[str] = None
    services: Dict[str, Any] = {}
    order: int
    children: List['SolutionTreeNode'] = []

class SolutionTreeResponse(BaseModel):
    """树形解决方案响应模式"""
    id: int
    module_id: int
    node_type: str
    node_name: str
    parent_id: Optional[int] = None
    description: Optional[str] = None
    services: Dict[str, Any] = {}
    order: int
    created_at: datetime

    class Config:
        from_attributes = True

# 个性化方案相关模式
class PersonalizedPlanBase(BaseModel):
    """个性化方案基础模式"""
    plan_data: Dict[str, Any]
    customer_preferences: Dict[str, Any] = {}
    reasoning_logic: Optional[str] = None

class PersonalizedPlanCreate(PersonalizedPlanBase):
    """创建个性化方案模式"""
    user_id: int
    analysis_id: int

class PersonalizedPlanUpdate(BaseModel):
    """更新个性化方案模式"""
    plan_data: Optional[Dict[str, Any]] = None
    customer_preferences: Optional[Dict[str, Any]] = None
    reasoning_logic: Optional[str] = None
    status: Optional[str] = None

class PersonalizedPlanResponse(PersonalizedPlanBase):
    """个性化方案响应模式"""
    id: int
    user_id: int
    analysis_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 用户反馈相关模式
class UserFeedbackBase(BaseModel):
    """用户反馈基础模式"""
    feedback_type: str
    feedback_data: Dict[str, Any]
    health_metrics: Optional[Dict[str, Any]] = None
    subjective_feelings: Optional[Dict[str, Any]] = None
    behavior_changes: Optional[Dict[str, Any]] = None

class UserFeedbackCreate(UserFeedbackBase):
    """创建用户反馈模式"""
    plan_id: int
    user_id: int

class UserFeedbackResponse(UserFeedbackBase):
    """用户反馈响应模式"""
    id: int
    plan_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# 健康报告相关模式
class HealthReportBase(BaseModel):
    """健康报告基础模式"""
    report_type: str
    report_data: Dict[str, Any]
    objective_metrics: Optional[Dict[str, Any]] = None
    subjective_improvements: Optional[Dict[str, Any]] = None
    behavior_transformations: Optional[Dict[str, Any]] = None
    visualization_data: Optional[Dict[str, Any]] = None

class HealthReportCreate(HealthReportBase):
    """创建健康报告模式"""
    user_id: int
    plan_id: int

class HealthReportResponse(HealthReportBase):
    """健康报告响应模式"""
    id: int
    user_id: int
    plan_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# 分页相关模式
class PaginationParams(BaseModel):
    """分页参数模式"""
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)

class PaginatedResponse(BaseModel):
    """分页响应模式"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

# API响应模式
class APIResponse(BaseModel):
    """API响应基础模式"""
    success: bool = True
    message: str = "操作成功"
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class ErrorResponse(BaseModel):
    """错误响应模式"""
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)
