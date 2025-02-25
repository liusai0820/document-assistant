'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { documentTemplates } from '@/data/documentTemplates';

// 动态导入客户端组件，禁用SSR
const WordPreview = dynamic(() => import('@/components/WordPreview'), { 
  ssr: false, 
  loading: () => <div className="animate-pulse p-4 h-96 bg-gray-100">加载预览组件...</div>
});

// 文档类型接口
interface DocumentData {
  id: string;
  title: string;
  type: string;
  subtype: string;
  createdAt: string;
  content: string;
}

// 添加一个内部组件来处理搜索参数
function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [templateContent, setTemplateContent] = useState<string>('');

  // 加载文档数据
  useEffect(() => {
    const docId = searchParams.get('id');
    const templateId = searchParams.get('template');
    
    if (templateId) {
      // 如果是模板预览
      const template = templateId as keyof typeof documentTemplates;
      if (documentTemplates[template]) {
        setTemplateContent(documentTemplates[template]);
        setIsLoading(false);
        return;
      }
    }
    
    if (!docId) {
      router.push('/documents');
      return;
    }

    try {
      // 尝试从sessionStorage获取当前文档
      const currentDoc = sessionStorage.getItem('currentDocument');
      if (currentDoc) {
        const parsedDoc = JSON.parse(currentDoc);
        setDocumentData(parsedDoc);
      } else {
        // 如果sessionStorage中没有，尝试从localStorage中查找
        const savedDocs = localStorage.getItem('savedDocuments');
        if (savedDocs) {
          const docs = JSON.parse(savedDocs);
          const foundDoc = docs.find((doc: DocumentData) => doc.id === docId);
          if (foundDoc) {
            setDocumentData(foundDoc);
          } else {
            throw new Error('文档不存在');
          }
        } else {
          throw new Error('未找到文档');
        }
      }
    } catch (error) {
      console.error('加载文档失败:', error);
      router.push('/documents');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, router]);

  // 根据当前状态返回正确的返回地址
  const getReturnLink = () => {
    const templateId = searchParams.get('template');
    
    // 如果是从模板页面过来，返回模板页面
    if (templateId) {
      return '/templates';
    }
    
    // 默认返回文档列表
    return '/documents';
  };
  
  // 导出文档
  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!documentData && !templateContent) return;
    
    try {
      const title = documentData ? documentData.title : '模板预览';
      
      // 如果是PDF格式，使用WordPreview组件内置的导出功能
      if (format === 'pdf') {
        // PDF导出由WordPreview组件内部处理
        // 触发一个自定义事件，让WordPreview组件处理PDF导出
        const exportEvent = new CustomEvent('export-pdf', {
          detail: { title }
        });
        document.dispatchEvent(exportEvent);
        return;
      }
      
      // Word格式导出仍使用API
      const content = documentData ? documentData.content : templateContent;
      console.log(`正在导出${format}格式文档: ${title}`);
      
      // 调用导出API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          format,
          title,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `导出失败: ${response.status}`);
      }
      
      // 获取导出文件的blob
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`导出${format}格式文档成功`);
    } catch (error) {
      console.error('导出文档失败:', error);
      alert('导出失败，请稍后重试');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            {documentData ? documentData.title : templateContent ? '模板预览' : '文档预览'}
          </h1>
          <div className="flex space-x-2">
            <Link href={getReturnLink()} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              返回列表
            </Link>
            <button
              onClick={() => handleExport('docx')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              导出Word
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              导出PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="p-4 sm:p-6">
                {/* 使用增强的WordPreview组件 */}
                <WordPreview 
                  content={documentData ? documentData.content : templateContent} 
                  isLoading={false}
                  title={documentData ? documentData.title : '模板预览'}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            文档助手 &copy; {new Date().getFullYear()} 版权所有
          </p>
        </div>
      </footer>
    </div>
  );
}

// 主导出组件
export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
} 