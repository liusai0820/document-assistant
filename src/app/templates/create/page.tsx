'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 模板接口
interface Template {
  id?: string;
  title: string;
  type: string;
  subtype: string;
  description: string;
  content: string;
  isCustom: boolean;
  thumbnail?: string;
}

export default function CreateTemplatePage() {
  const router = useRouter();
  
  // 状态管理
  const [template, setTemplate] = useState<Template>({
    title: '',
    type: 'official',
    subtype: 'notice',
    description: '',
    content: '',
    isCustom: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 文档类型数据
  const documentTypes = [
    { id: 'official', name: '公文' },
    { id: 'report', name: '报告' },
    { id: 'plan', name: '计划' },
    { id: 'summary', name: '总结' },
  ];
  
  // 子类型数据
  const documentSubtypes: Record<string, { id: string, name: string }[]> = {
    official: [
      { id: 'notice', name: '通知' },
      { id: 'announcement', name: '公告' },
      { id: 'opinion', name: '意见' },
      { id: 'reply', name: '批复' },
    ],
    report: [
      { id: 'work_report', name: '工作报告' },
      { id: 'research_report', name: '调研报告' },
      { id: 'summary_report', name: '总结报告' },
      { id: 'inspection_report', name: '考察报告' },
    ],
    plan: [
      { id: 'work_plan', name: '工作计划' },
      { id: 'project_plan', name: '项目计划' },
      { id: 'implementation_plan', name: '实施方案' },
    ],
    summary: [
      { id: 'work_summary', name: '工作总结' },
      { id: 'project_summary', name: '项目总结' },
      { id: 'meeting_minutes', name: '会议纪要' },
    ],
  };
  
  // 处理表单字段变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ 
      ...prev, 
      [name]: value,
      // 如果类型改变了，重置子类型
      ...(name === 'type' ? { subtype: documentSubtypes[value][0].id } : {})
    }));
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // 验证表单
      if (!template.title || !template.description || !template.content) {
        throw new Error('请填写所有必填字段');
      }
      
      // 使用当前时间戳作为ID
      const templateWithId = {
        ...template,
        id: `custom-${Date.now()}`,
        thumbnail: '📝' // 使用固定图标
      };
      
      // 获取现有的自定义模板
      let customTemplates: Template[] = [];
      const storedTemplates = localStorage.getItem('customTemplates');
      if (storedTemplates) {
        customTemplates = JSON.parse(storedTemplates);
      }
      
      // 添加新模板
      customTemplates.push(templateWithId);
      
      // 保存到localStorage
      localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
      
      // 导航回模板中心
      router.push('/templates');
    } catch (error) {
      setError(error instanceof Error ? error.message : '提交表单时出错');
    } finally {
      setIsSubmitting(false);
    }
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
              <Link href="/documents" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                我的文档
              </Link>
              <Link href="/templates" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                模板中心
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">创建自定义模板</h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  模板标题 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={template.title}
                  onChange={handleChange}
                  placeholder="请输入模板标题"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                    文档类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={template.type}
                    onChange={handleChange}
                    required
                  >
                    {documentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subtype">
                    文档子类型 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subtype"
                    name="subtype"
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={template.subtype}
                    onChange={handleChange}
                    required
                  >
                    {documentSubtypes[template.type].map(subtype => (
                      <option key={subtype.id} value={subtype.id}>{subtype.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  模板描述 <span className="text-red-500">*</span>
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={template.description}
                  onChange={handleChange}
                  placeholder="请简要描述模板用途"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                  模板内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-64"
                  value={template.content}
                  onChange={handleChange}
                  placeholder="请输入模板内容，可以包含AI提示词、文档结构要求等。支持使用{title}、{content}和{requirements}作为占位符。"
                  required
                />
              </div>
              
              <div className="flex justify-between">
                <Link
                  href="/templates"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </Link>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:bg-blue-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '保存中...' : '保存模板'}
                </button>
              </div>
            </form>
          </div>
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