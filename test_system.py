"""
测试系统功能
"""

import requests
import json
import time

def test_system():
    """测试系统功能"""
    base_url = "http://localhost:8000"
    
    print("🧪 开始测试系统功能...")
    
    # 测试健康检查
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ 健康检查通过")
            print(f"   响应: {response.json()}")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 健康检查异常: {str(e)}")
        return False
    
    # 测试首页
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ 首页访问正常")
        else:
            print(f"❌ 首页访问失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 首页访问异常: {str(e)}")
    
    # 测试API文档
    try:
        response = requests.get(f"{base_url}/api/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API文档访问正常")
        else:
            print(f"❌ API文档访问失败: {response.status_code}")
    except Exception as e:
        print(f"❌ API文档访问异常: {str(e)}")
    
    # 测试用户列表API
    try:
        response = requests.get(f"{base_url}/api/admin/users", timeout=5)
        if response.status_code == 200:
            print("✅ 用户列表API正常")
            data = response.json()
            if data.get("success"):
                users = data.get("data", {}).get("users", [])
                print(f"   找到 {len(users)} 个用户")
                for user in users:
                    print(f"   - {user['username']} ({user['role']})")
        else:
            print(f"❌ 用户列表API失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 用户列表API异常: {str(e)}")
    
    # 测试仪表板API
    try:
        response = requests.get(f"{base_url}/api/admin/dashboard", timeout=5)
        if response.status_code == 200:
            print("✅ 仪表板API正常")
            data = response.json()
            if data.get("success"):
                overview = data.get("data", {}).get("overview", {})
                print(f"   总用户数: {overview.get('total_users', 0)}")
                print(f"   音频记录数: {overview.get('total_audio_records', 0)}")
                print(f"   分析记录数: {overview.get('total_analyses', 0)}")
        else:
            print(f"❌ 仪表板API失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 仪表板API异常: {str(e)}")
    
    print("\n🎉 系统测试完成！")
    return True

if __name__ == "__main__":
    # 等待系统启动
    print("⏳ 等待系统启动...")
    time.sleep(2)
    
    test_system()
