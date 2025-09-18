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

# 静态文件和模板（注释掉，使用React前端）
# app.mount("/static", StaticFiles(directory="app/static"), name="static")
# templates = Jinja2Templates(directory="app/templates")

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
    """系统首页"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>健康咨询录音需求解析系统</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
            .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
            .feature-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
            .feature-card h3 { color: #2c3e50; margin-top: 0; }
            .api-link { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .api-link:hover { background: #2980b9; }
            .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏥 健康咨询录音需求解析系统</h1>
            
            <div class="status">
                <strong>系统状态：</strong> 运行正常 ✅<br>
                <strong>版本：</strong> 1.0.0<br>
                <strong>启动时间：</strong> """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """
            </div>

            <h2>核心功能模块</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>🎵 音频处理模块</h3>
                    <p>支持多种音频格式的录音转写，高精度语音识别，保留时间戳信息</p>
                </div>
                <div class="feature-card">
                    <h3>🧠 AI需求分析</h3>
                    <p>九阶段处理流程：从信息提取到个性化方案生成的全流程智能化</p>
                </div>
                <div class="feature-card">
                    <h3>📋 健康简历</h3>
                    <p>动态记录用户全维度健康信息，支持多维度评估和持续更新</p>
                </div>
                <div class="feature-card">
                    <h3>📊 智能报告</h3>
                    <p>多维度健康改善报告，可视化展示健康指标变化趋势</p>
                </div>
                <div class="feature-card">
                    <h3>🔄 动态调整</h3>
                    <p>基于用户反馈持续优化健康管理方案，实现个性化服务</p>
                </div>
                <div class="feature-card">
                    <h3>⚙️ 系统管理</h3>
                    <p>用户管理、权限控制、数据备份等系统管理功能</p>
                </div>
            </div>

            <h2>API接口</h2>
            <a href="/api/docs" class="api-link">📚 API文档 (Swagger)</a>
            <a href="/api/redoc" class="api-link">📖 API文档 (ReDoc)</a>
            
            <h2>系统架构</h2>
            <p>本系统基于FastAPI构建，采用微服务架构，支持高并发处理。核心AI模块集成OpenAI GPT和Whisper，实现智能化的健康需求分析和方案生成。</p>
            
            <h3>九阶段处理流程：</h3>
            <ol>
                <li><strong>多源数据采集与解析</strong> - 录音转写与信息提取</li>
                <li><strong>多维健康需求评估</strong> - 五维度发散性评估</li>
                <li><strong>需求分析结果验证</strong> - 逐条验证与置信度评分</li>
                <li><strong>整合需求形成框架</strong> - 系统性问题解决框架</li>
                <li><strong>框架排序</strong> - 多维度评分与优先级排序</li>
                <li><strong>树形方案构建</strong> - 树形可行方案生成</li>
                <li><strong>个性化方案</strong> - 可实施方案匹配</li>
                <li><strong>动态调整</strong> - 数字人管理方案调整</li>
                <li><strong>定期反馈报告</strong> - 多维度健康改善报告</li>
            </ol>
        </div>
    </body>
    </html>
    """

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

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
