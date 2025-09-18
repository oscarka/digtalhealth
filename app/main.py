"""
健康咨询录音需求解析系统 - 主应用入口
基于FastAPI构建的后端服务
"""

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import uvicorn
import os
from datetime import datetime
from typing import List, Optional

from app.database import get_db, engine
from app.models import Base
from app.routers import audio, analysis, health_profile, reports, admin, health_resume
from app.core.config import settings
from app.services.ai_service import AIService
from app.services.audio_service import AudioService

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建FastAPI应用
app = FastAPI(
    title="健康咨询录音需求解析系统",
    description="基于AI的健康咨询录音分析系统，实现九阶段处理流程",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件和模板
app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")
templates = Jinja2Templates(directory="frontend/build")

# 注册路由
app.include_router(audio.router, prefix="/api/audio", tags=["音频处理"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["需求分析"])
app.include_router(health_profile.router, prefix="/api/health-profile", tags=["健康简历"])
app.include_router(health_resume.router, prefix="/api/health-resume", tags=["健康简历系统"])
app.include_router(reports.router, prefix="/api/reports", tags=["报告生成"])
app.include_router(admin.router, prefix="/api/admin", tags=["系统管理"])

# 初始化服务
ai_service = AIService()
audio_service = AudioService()

@app.get("/", response_class=HTMLResponse)
async def root():
    """系统首页 - 返回React应用"""
    return templates.TemplateResponse("index.html", {"request": {}})

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "ai_service": "ready",
            "audio_service": "ready"
        }
    }

# 支持React Router - 所有非API路由都返回React应用
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """支持React Router的单页应用路由"""
    # 如果是API路由，跳过
    if full_path.startswith("api/") or full_path.startswith("static/"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # 其他所有路由都返回React应用
    return templates.TemplateResponse("index.html", {"request": {}})

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.DEBUG,
        log_level="info"
    )
