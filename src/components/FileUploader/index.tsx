'use client';

import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
  onError: (error: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // 单位：MB
  className?: string;
}

const DEFAULT_MAX_SIZE = 10; // 默认最大10MB

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileContent,
  onError,
  label = '上传文档参考材料',
  accept = '.txt,.docx,.pdf,.md',
  maxSize = DEFAULT_MAX_SIZE,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      onError(`文件大小超过限制(${maxSize}MB)`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', file);

      // 发送到API处理文件
      const response = await fetch('/api/file-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('上传失败响应:', errorText);
        throw new Error(`上传失败: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('解析响应JSON失败:', parseError);
        throw new Error('无法解析服务器响应');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.content) {
        throw new Error('服务器未返回文件内容');
      }

      // 返回提取的文本内容
      onFileContent(data.content, file.name);
    } catch (error) {
      console.error('文件上传/处理出错:', error);
      onError(error instanceof Error ? error.message : '文件处理失败');
    } finally {
      setIsLoading(false);
      // 清空文件输入，以便再次上传同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // 手动设置到input中，触发onChange事件
      if (fileInputRef.current) {
        // 创建新的DataTransfer对象
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        fileInputRef.current.files = dataTransfer.files;
        
        // 手动触发onChange事件
        handleFileChange({
          target: fileInputRef.current,
          currentTarget: fileInputRef.current
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
          isLoading ? 'bg-gray-100 cursor-wait' : ''
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">正在处理: {fileName}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-1 text-sm text-gray-700">
              <span className="font-semibold">点击上传</span> 或拖放文件到这里
            </p>
            <p className="text-xs text-gray-500">
              支持 {accept.split(',').join(', ')} (最大 {maxSize}MB)
            </p>
            {fileName && <p className="mt-2 text-sm text-blue-600">{fileName}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader; 