# 部署指南

## Railway 部署

### 1. 准备代码
```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit for Railway deployment"

# 添加远程仓库
git remote add origin https://github.com/oscarka/digtalhealth.git

# 推送到GitHub
git push -u origin main
```

### 2. Railway 部署步骤

1. 访问 [Railway](https://railway.app)
2. 使用GitHub账号登录
3. 点击 "New Project" -> "Deploy from GitHub repo"
4. 选择 `oscarka/digtalhealth` 仓库
5. 点击 "Deploy Now"

### 3. 环境变量配置

在Railway项目设置中添加以下环境变量：

```
DEBUG=False
PORT=8000
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://username:password@host:port
```

### 4. 数据库配置

Railway会自动提供PostgreSQL数据库，在环境变量中设置 `DATABASE_URL`。

### 5. 静态文件服务

前端文件需要单独部署到CDN或静态文件服务，或者集成到FastAPI中。

## 本地开发

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 设置环境变量
```bash
cp env.example .env
# 编辑 .env 文件，填入你的配置
```

### 3. 运行应用
```bash
python -m uvicorn app.main:app --reload
```

## 注意事项

1. 确保所有敏感信息都通过环境变量配置
2. 生产环境建议使用PostgreSQL数据库
3. 文件上传功能需要配置适当的存储服务
4. OpenAI API密钥需要有效且有足够的配额
