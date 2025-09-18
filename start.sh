#!/bin/bash

# 设置默认端口
DEFAULT_PORT=8000

# 获取Railway提供的端口，如果没有则使用默认端口
PORT=${PORT:-$DEFAULT_PORT}

# 确保端口是数字
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "Warning: PORT is not a valid number, using default port $DEFAULT_PORT"
    PORT=$DEFAULT_PORT
fi

echo "Starting application on port $PORT"

# 启动应用
exec python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
