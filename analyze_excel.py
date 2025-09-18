"""
分析Excel文件内容，提取健康需求分析案例数据
"""

import pandas as pd
import json
from pathlib import Path

def analyze_excel_file():
    """分析Excel文件内容"""
    excel_file = "案例健康需求分析9-5(1).xlsx"
    
    try:
        # 读取Excel文件的所有工作表
        excel_data = pd.read_excel(excel_file, sheet_name=None)
        
        print("📊 Excel文件分析结果：")
        print(f"工作表数量: {len(excel_data)}")
        
        for sheet_name, df in excel_data.items():
            print(f"\n📋 工作表: {sheet_name}")
            print(f"行数: {len(df)}")
            print(f"列数: {len(df.columns)}")
            print(f"列名: {list(df.columns)}")
            
            # 显示前几行数据
            print("\n前5行数据:")
            print(df.head().to_string())
            
            # 检查是否有空值
            null_counts = df.isnull().sum()
            if null_counts.sum() > 0:
                print(f"\n空值统计:")
                print(null_counts[null_counts > 0])
        
        return excel_data
        
    except Exception as e:
        print(f"❌ 读取Excel文件失败: {str(e)}")
        return None

def extract_case_data(excel_data):
    """提取案例数据"""
    if not excel_data:
        return None
    
    case_data = {}
    
    for sheet_name, df in excel_data.items():
        print(f"\n🔍 分析工作表: {sheet_name}")
        
        # 将DataFrame转换为字典格式
        sheet_data = {
            "columns": list(df.columns),
            "data": df.to_dict('records'),
            "shape": df.shape
        }
        
        case_data[sheet_name] = sheet_data
        
        # 分析数据结构
        print(f"数据结构分析:")
        for col in df.columns:
            if not df[col].isnull().all():
                sample_values = df[col].dropna().head(3).tolist()
                print(f"  {col}: {sample_values}")
    
    return case_data

def create_case_examples(case_data):
    """根据Excel数据创建案例示例"""
    if not case_data:
        return None
    
    examples = {}
    
    for sheet_name, data in case_data.items():
        print(f"\n📝 处理工作表: {sheet_name}")
        
        # 根据工作表名称和内容创建相应的案例
        if "sheet1" in sheet_name.lower() or len(data["data"]) > 0:
            # 假设第一个工作表包含基础案例信息
            examples["basic_case"] = {
                "sheet_name": sheet_name,
                "columns": data["columns"],
                "sample_data": data["data"][:3] if data["data"] else []
            }
        elif "sheet2" in sheet_name.lower():
            # 假设第二个工作表包含分析结果
            examples["analysis_results"] = {
                "sheet_name": sheet_name,
                "columns": data["columns"],
                "sample_data": data["data"][:3] if data["data"] else []
            }
        elif "sheet3" in sheet_name.lower():
            # 假设第三个工作表包含解决方案
            examples["solutions"] = {
                "sheet_name": sheet_name,
                "columns": data["columns"],
                "sample_data": data["data"][:3] if data["data"] else []
            }
    
    return examples

if __name__ == "__main__":
    print("🚀 开始分析Excel文件...")
    
    # 分析Excel文件
    excel_data = analyze_excel_file()
    
    if excel_data:
        # 提取案例数据
        case_data = extract_case_data(excel_data)
        
        # 创建案例示例
        examples = create_case_examples(case_data)
        
        # 保存分析结果
        with open("excel_analysis_result.json", "w", encoding="utf-8") as f:
            json.dump({
                "excel_data": case_data,
                "examples": examples
            }, f, ensure_ascii=False, indent=2)
        
        print("\n✅ Excel分析完成，结果已保存到 excel_analysis_result.json")
    else:
        print("\n❌ Excel分析失败")
