# 健康咨询录音需求解析系统

基于AI的健康咨询录音分析系统，实现九阶段处理流程，从录音转写到个性化方案生成的全流程智能化服务。

## 🎯 系统概述

本系统是一个基于"数字人"模型的个人健康管理智能引擎。它以"健康简历"为核心数据载体，全面、动态地记录和分析个体的多维度健康信息。系统通过九个核心阶段，将非结构化的健康咨询录音转化为结构化的、可执行的、个性化的健康管理方案。

## 🏗️ 系统架构

### 技术栈
- **后端框架**: FastAPI
- **数据库**: SQLite (可扩展至PostgreSQL)
- **AI服务**: OpenAI GPT-4 + Whisper
- **音频处理**: librosa, soundfile
- **数据可视化**: Plotly, Matplotlib
- **异步处理**: Celery + Redis

### 核心模块
- **音频处理模块**: 支持多种格式的录音转写
- **AI分析模块**: 九阶段智能分析流程
- **健康简历模块**: 动态健康信息管理
- **报告生成模块**: 多维度健康报告
- **系统管理模块**: 用户管理、权限控制

## 🚀 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 创建演示数据

```bash
python create_demo_data.py
```

### 3. 启动系统

```bash
python run_demo.py
```

或者直接使用uvicorn：

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. 访问系统

- **系统首页**: http://localhost:8000
- **API文档**: http://localhost:8000/api/docs
- **ReDoc文档**: http://localhost:8000/api/redoc

## 📋 九阶段处理流程

### 第一阶段：多源数据采集与解析
- 音频文件上传和格式验证
- 高精度语音转文本（ASR）
- 核心信息提取和结构化

### 第二阶段：多维健康需求评估
- 生物医学维度评估
- 心理维度评估
- 社会环境维度评估
- 制度政策维度评估
- 生命历程维度评估

### 第三阶段：需求分析结果验证
- 逐条验证健康需求
- 置信度评分
- 验证依据追溯

### 第四阶段：整合需求形成框架
- 需求聚合与收敛
- 系统性问题解决框架构建
- 模块指标量化

### 第五阶段：框架排序
- 多维度评分模型
- 疾病风险等级评估
- 执行改善程度评估
- 客户可接受度评估

### 第六阶段：树形方案构建
- 树形解决方案生成
- 节点服务嵌入
- 分层整合优化

### 第七阶段：个性化方案
- 公司服务元素匹配
- 客户偏好整合
- 综合落地推理逻辑

### 第八阶段：动态调整
- 数据反馈监控
- 方案动态调整
- 分析逻辑展示

### 第九阶段：定期反馈报告
- 多维度健康改善报告
- 客观指标量化改善
- 主观感受直观提升
- 行为习惯正向转变

## 🔧 API接口

### 音频处理
- `POST /api/audio/upload` - 上传音频文件
- `GET /api/audio/records/{user_id}` - 获取用户音频记录
- `GET /api/audio/record/{record_id}` - 获取音频记录详情

### 健康分析
- `POST /api/analysis/start/{audio_record_id}` - 开始健康分析
- `GET /api/analysis/status/{analysis_id}` - 获取分析状态
- `GET /api/analysis/result/{analysis_id}` - 获取分析结果

### 健康简历
- `POST /api/health-profile/create` - 创建健康简历
- `GET /api/health-profile/user/{user_id}` - 获取用户健康简历
- `PUT /api/health-profile/update/{profile_id}` - 更新健康简历

### 健康报告
- `POST /api/reports/generate` - 生成健康报告
- `GET /api/reports/user/{user_id}` - 获取用户报告列表
- `GET /api/reports/trends/{user_id}` - 获取健康趋势

### 系统管理
- `GET /api/admin/dashboard` - 获取系统仪表板
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建用户
- `GET /api/admin/system-logs` - 获取系统日志

## 👥 演示用户

系统预置了以下演示用户：

- **管理员**: admin / admin@healthsystem.com
- **健康管理师**: health_manager / manager@healthsystem.com
- **客户1**: client001 / client001@example.com
- **客户2**: client002 / client002@example.com
- **客户3**: client003 / client003@example.com

## 📊 演示数据

系统包含完整的演示数据：

- 3个客户用户的音频记录
- 对应的健康简历和转写文本
- 完整的九阶段分析结果
- 个性化健康管理方案
- 用户反馈和健康报告

## 🔒 安全特性

- 数据加密存储和传输
- 角色权限管理
- 访问控制机制
- 合规性保障

## 📈 性能指标

- **响应时间**: 单次分析5分钟内完成
- **并发处理**: 支持100个并发用户
- **可用性**: 99.9%可用性保证
- **数据备份**: 完善的数据备份机制

## 🛠️ 开发指南

### 项目结构

```
digtalhealthdemo/
├── app/
│   ├── __init__.py
│   ├── main.py                 # 主应用入口
│   ├── database.py             # 数据库连接
│   ├── models.py               # 数据模型
│   ├── schemas.py              # Pydantic模式
│   ├── core/
│   │   └── config.py           # 配置管理
│   ├── services/
│   │   ├── ai_service.py       # AI分析服务
│   │   ├── audio_service.py    # 音频处理服务
│   │   └── analysis_service.py # 分析协调服务
│   └── routers/
│       ├── audio.py            # 音频处理路由
│       ├── analysis.py         # 健康分析路由
│       ├── health_profile.py   # 健康简历路由
│       ├── reports.py          # 报告生成路由
│       └── admin.py            # 系统管理路由
├── requirements.txt            # 依赖包
├── create_demo_data.py        # 演示数据创建
├── run_demo.py               # 系统启动脚本
└── README.md                 # 项目说明
```

### 环境配置

创建 `.env` 文件：

```env
# OpenAI配置
OPENAI_API_KEY=your_openai_api_key_here

# 数据库配置
DATABASE_URL=sqlite:///./health_system.db

# Redis配置
REDIS_URL=redis://localhost:6379

# 文件存储配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=104857600

# JWT配置
SECRET_KEY=your-secret-key-here
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题或建议，请联系开发团队。

---

**健康咨询录音需求解析系统** - 让AI成为您的健康管理专家 🏥✨
