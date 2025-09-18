"""
系统配置管理
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """系统配置"""
    
    # 应用配置
    APP_NAME: str = "健康咨询录音需求解析系统"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Railway端口配置
    PORT: int = int(os.getenv("PORT", "8000"))
    
    @property
    def port(self) -> int:
        """获取端口号，支持Railway环境变量"""
        try:
            return int(os.getenv("PORT", "8000"))
        except (ValueError, TypeError):
            return 8000
    
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./health_system.db"
    # DATABASE_URL: str = "postgresql://user:password@localhost/health_system"
    
    # Railway环境变量支持
    @property
    def database_url(self) -> str:
        """获取数据库URL，支持Railway环境变量"""
        return os.getenv("DATABASE_URL", self.DATABASE_URL)
    
    # Redis配置
    REDIS_URL: str = "redis://localhost:6379"
    
    # OpenAI配置
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    
    # 文件存储配置
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_AUDIO_FORMATS: list = [".mp3", ".wav", ".m4a", ".flac"]
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 分页配置
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # AI分析配置
    ANALYSIS_TIMEOUT: int = 300  # 5分钟
    MAX_CONCURRENT_ANALYSES: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# 创建全局配置实例
settings = Settings()

# 确保上传目录存在
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
