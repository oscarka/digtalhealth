"""
运行演示系统
启动健康咨询录音需求解析系统
"""

import uvicorn
import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def main():
    """启动演示系统"""
    print("🏥 健康咨询录音需求解析系统")
    print("=" * 50)
    print("🚀 正在启动系统...")
    
    # 检查环境
    if not os.path.exists("app"):
        print("❌ 错误：找不到app目录")
        return
    
    # 启动服务器
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 系统已停止")
    except Exception as e:
        print(f"❌ 启动失败：{str(e)}")

if __name__ == "__main__":
    main()
