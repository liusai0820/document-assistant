'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 文档类型接口
interface DocumentData {
  id: string;
  title: string;
  type: string;
  subtype: string;
  createdAt: string;
  content: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟从本地存储加载文档列表
  useEffect(() => {
    // 在实际应用中，这里会从后端API或本地存储加载数据
    const loadDocuments = () => {
      try {
        // 尝试从localStorage获取文档
        const savedDocs = localStorage.getItem('savedDocuments');
        if (savedDocs) {
          setDocuments(JSON.parse(savedDocs));
        } else {
          // 如果没有保存的文档，使用示例数据
          setDocuments([
            {
              id: '1',
              title: '关于加强信息化建设的通知',
              type: 'official',
              subtype: 'notice',
              createdAt: '2023-05-15T09:30:00Z',
              content: '# 关于加强信息化建设的通知\n\n## 一、背景与目的\n\n为进一步推进我单位信息化建设...'
            },
            {
              id: '2',
              title: '2023年度工作总结',
              type: 'summary',
              subtype: 'work_summary',
              createdAt: '2023-12-25T15:00:00Z',
              content: '# 2023年度工作总结\n\n## 一、工作概述\n\n2023年，我单位在各级领导的正确指导下...'
            },
            {
              id: '3',
              title: '市场调研报告',
              type: 'report',
              subtype: 'research_report',
              createdAt: '2023-08-10T11:20:00Z',
              content: '# 市场调研报告\n\n## 一、调研背景\n\n为了更好地了解市场需求和消费者偏好...'
            }
          ]);
        }
      } catch (error) {
        console.error('加载文档失败:', error);
        // 出错时使用空数组
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    // 模拟加载延迟
    setTimeout(loadDocuments, 500);
  }, []);

  // 文档类型名称映射
  const typeNames: Record<string, string> = {
    'official': '公文',
    'report': '报告',
    'plan': '计划',
    'summary': '总结'
  };

  // 子类型名称映射
  const subtypeNames: Record<string, Record<string, string>> = {
    official: {
      notice: '通知',
      announcement: '公告',
      opinion: '意见',
      reply: '批复',
    },
    report: {
      work_report: '工作报告',
      research_report: '调研报告',
      summary_report: '总结报告',
      inspection_report: '考察报告',
    },
    plan: {
      work_plan: '工作计划',
      project_plan: '项目计划',
      implementation_plan: '实施方案',
    },
    summary: {
      work_summary: '工作总结',
      project_summary: '项目总结',
      meeting_minutes: '会议纪要',
    },
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 处理文档点击
  const handleDocumentClick = (document: DocumentData) => {
    // 在实际应用中，这里会跳转到文档预览页面
    // 这里仅做简单模拟，将文档内容保存到sessionStorage并跳转
    sessionStorage.setItem('currentDocument', JSON.stringify(document));
    router.push(`/preview?id=${document.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                公文写作助手
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                首页
              </Link>
              <Link href="/documents" className="text-gray-900 border-b-2 border-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                我的文档
              </Link>
              <Link href="/templates" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                模板中心
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">我的文档</h1>
            <Link 
              href="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              新建文档
            </Link>
          </div>

          {isLoading ? (
            // 加载中状态
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-500">加载中，请稍候...</p>
            </div>
          ) : documents.length > 0 ? (
            // 文档列表
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文档标题
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建日期
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr 
                      key={doc.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {typeNames[doc.type] || '未知类型'}
                          {doc.subtype && subtypeNames[doc.type] && subtypeNames[doc.type][doc.subtype] && 
                            ` (${subtypeNames[doc.type][doc.subtype]})`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(doc.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            handleDocumentClick(doc);
                          }}
                        >
                          查看
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            if (confirm('确定要删除这个文档吗？')) {
                              // 在实际应用中，这里会调用API删除文档
                              // 这里仅做简单模拟
                              const newDocs = documents.filter(d => d.id !== doc.id);
                              setDocuments(newDocs);
                              // 保存到本地存储
                              localStorage.setItem('savedDocuments', JSON.stringify(newDocs));
                            }
                          }}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // 空状态
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文档</h3>
              <p className="text-gray-500 mb-4">您还没有创建任何文档，点击下方按钮开始创建</p>
              <Link 
                href="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                新建文档
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>© {new Date().getFullYear()} 公文写作助手 - 专业的公文写作辅助工具</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 