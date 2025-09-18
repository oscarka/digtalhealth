"""
音频处理服务
负责音频文件的上传、存储、格式转换等
"""

import os
import uuid
import aiofiles
from typing import Optional, Dict, Any
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import librosa
import soundfile as sf

class AudioService:
    """音频处理服务"""
    
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_formats = settings.ALLOWED_AUDIO_FORMATS
    
    async def save_upload_file(self, file: UploadFile) -> Dict[str, Any]:
        """
        保存上传的音频文件
        """
        try:
            # 验证文件格式
            file_extension = os.path.splitext(file.filename)[1].lower()
            if file_extension not in self.allowed_formats:
                raise HTTPException(
                    status_code=400,
                    detail=f"不支持的文件格式。支持的格式：{', '.join(self.allowed_formats)}"
                )
            
            # 验证文件大小
            if file.size > self.max_file_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"文件大小超过限制。最大允许：{self.max_file_size / (1024*1024):.1f}MB"
                )
            
            # 生成唯一文件名
            file_id = str(uuid.uuid4())
            filename = f"{file_id}{file_extension}"
            file_path = os.path.join(self.upload_dir, filename)
            
            # 保存文件
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # 获取音频信息
            audio_info = await self.get_audio_info(file_path)
            
            return {
                "file_id": file_id,
                "filename": filename,
                "file_path": file_path,
                "file_size": file.size,
                "duration": audio_info.get("duration"),
                "format": file_extension[1:],  # 去掉点号
                "sample_rate": audio_info.get("sample_rate"),
                "channels": audio_info.get("channels")
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"文件保存失败：{str(e)}")
    
    async def get_audio_info(self, file_path: str) -> Dict[str, Any]:
        """
        获取音频文件信息
        """
        try:
            # 使用librosa获取音频信息
            y, sr = librosa.load(file_path, sr=None)
            duration = len(y) / sr
            
            # 获取声道数
            info = sf.info(file_path)
            channels = info.channels
            
            return {
                "duration": duration,
                "sample_rate": sr,
                "channels": channels,
                "samples": len(y)
            }
            
        except Exception as e:
            # 如果librosa失败，返回默认值
            return {
                "duration": None,
                "sample_rate": None,
                "channels": None,
                "samples": None
            }
    
    async def convert_audio_format(self, input_path: str, output_format: str = "wav") -> str:
        """
        转换音频格式
        """
        try:
            # 生成输出文件路径
            file_id = str(uuid.uuid4())
            output_filename = f"{file_id}.{output_format}"
            output_path = os.path.join(self.upload_dir, output_filename)
            
            # 使用librosa进行格式转换
            y, sr = librosa.load(input_path, sr=None)
            sf.write(output_path, y, sr)
            
            return output_path
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"音频格式转换失败：{str(e)}")
    
    async def delete_file(self, file_path: str) -> bool:
        """
        删除文件
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"文件删除失败：{str(e)}")
            return False
    
    def validate_audio_file(self, file: UploadFile) -> bool:
        """
        验证音频文件
        """
        # 检查文件扩展名
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in self.allowed_formats:
            return False
        
        # 检查文件大小
        if file.size > self.max_file_size:
            return False
        
        return True
