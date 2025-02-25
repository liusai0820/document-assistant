'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// 模板类型接口
interface Template {
  id: string;
  title: string;
  type: string;
  subtype: string;
  description: string;
  thumbnail: string;
  isCustom?: boolean;
  content?: string;
}

// 模板分类接口
interface TemplateCategory {
  id: string;
  name: string;
  templates: Template[];
}

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  
  // 加载自定义模板
  useEffect(() => {
    const loadCustomTemplates = () => {
      try {
        const storedTemplates = localStorage.getItem('customTemplates');
        if (storedTemplates) {
          setCustomTemplates(JSON.parse(storedTemplates));
        }
      } catch (error) {
        console.error('加载自定义模板失败:', error);
      }
    };
    
    loadCustomTemplates();
  }, []);

  // 系统预设模板数据
  const systemTemplateCategories: TemplateCategory[] = [
    {
      id: 'official',
      name: '公文模板',
      templates: [
        {
          id: 'redHeaderDocument',
          title: '红头文件模板',
          type: 'official',
          subtype: 'red_header',
          description: '规范的红头文件格式，适用于通知、公告等正式公文',
          thumbnail: '📄'
        },
        {
          id: 'announcement-template',
          title: '公告模板',
          type: 'official',
          subtype: 'announcement',
          description: '正式的公告格式，适用于向公众发布信息的场景',
          thumbnail: '📃'
        },
        {
          id: 'opinion-template',
          title: '意见模板',
          type: 'official',
          subtype: 'opinion',
          description: '标准的意见公文格式，适用于对工作提出建议的场景',
          thumbnail: '📝'
        }
      ]
    },
    {
      id: 'report',
      name: '报告模板',
      templates: [
        {
          id: 'workReport',
          title: '工作报告模板',
          type: 'report',
          subtype: 'work_report',
          description: '详实的工作报告格式，适用于总结工作情况、成效等',
          thumbnail: '📊'
        },
        {
          id: 'research-report-template',
          title: '调研报告模板',
          type: 'report',
          subtype: 'research_report',
          description: '专业的调研报告格式，适用于呈现调查研究结果',
          thumbnail: '🔍'
        }
      ]
    },
    {
      id: 'plan',
      name: '计划模板',
      templates: [
        {
          id: 'work-plan-template',
          title: '工作计划模板',
          type: 'plan',
          subtype: 'work_plan',
          description: '系统的工作计划格式，适用于制定未来工作方向和目标',
          thumbnail: '📅'
        },
        {
          id: 'project-plan-template',
          title: '项目计划模板',
          type: 'plan',
          subtype: 'project_plan',
          description: '详细的项目计划格式，适用于规划项目实施方案',
          thumbnail: '📋'
        }
      ]
    },
    {
      id: 'summary',
      name: '总结模板',
      templates: [
        {
          id: 'work-summary-template',
          title: '工作总结模板',
          type: 'summary',
          subtype: 'work_summary',
          description: '全面的工作总结格式，适用于回顾工作成果和经验',
          thumbnail: '📑'
        },
        {
          id: 'meetingMinutes',
          title: '会议纪要模板',
          type: 'summary',
          subtype: 'meeting_minutes',
          description: '规范的会议纪要格式，适用于记录会议内容和决议',
          thumbnail: '📝'
        }
      ]
    }
  ];
  
  // 合并系统模板和自定义模板
  const allTemplateCategories: TemplateCategory[] = [
    ...systemTemplateCategories,
  ];
  
  // 如果有自定义模板，添加自定义模板分类
  if (customTemplates.length > 0) {
    allTemplateCategories.push({
      id: 'custom',
      name: '我的模板',
      templates: customTemplates
    });
  }

  // 获取当前分类的模板
  const getTemplates = () => {
    if (activeCategory === 'all') {
      // 返回所有模板
      return [
        ...systemTemplateCategories.flatMap(category => category.templates),
        ...customTemplates
      ];
    } else if (activeCategory === 'custom') {
      // 只返回自定义模板
      return customTemplates;
    } else {
      // 返回特定分类的模板
      const category = systemTemplateCategories.find(c => c.id === activeCategory);
      return category ? category.templates : [];
    }
  };

  // 删除自定义模板
  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('确定要删除这个模板吗？')) {
      try {
        // 从localStorage中获取自定义模板
        const storedTemplates = localStorage.getItem('customTemplates');
        if (storedTemplates) {
          const templates = JSON.parse(storedTemplates);
          // 过滤掉要删除的模板
          const updatedTemplates = templates.filter((t: Template) => t.id !== id);
          // 保存回localStorage
          localStorage.setItem('customTemplates', JSON.stringify(updatedTemplates));
          // 更新状态
          setCustomTemplates(updatedTemplates);
        }
      } catch (error) {
        console.error('删除模板失败:', error);
        alert('删除模板失败，请重试');
      }
    }
  };

  // 模板卡片组件
  const TemplateCard = ({ template }: { template: Template }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl">{template.thumbnail}</div>
            {template.isCustom && (
              <button
                className="text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTemplate(template.id);
                }}
                title="删除模板"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
          <div className="flex justify-between items-center">
            <Link
              href={`/templates/create?template=${template.id}`}
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              使用模板
            </Link>
            {/* 添加预览按钮 */}
            <Link
              href={`/preview?template=${template.id}`}
              className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              预览
            </Link>
          </div>
        </div>
      </div>
    );
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
              <Link href="/templates" className="text-gray-900 border-b-2 border-blue-500 px-3 py-2 rounded-md text-sm font-medium">
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
            <h1 className="text-2xl font-bold text-gray-900">模板中心</h1>
            <Link
              href="/templates/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              创建模板
            </Link>
          </div>

          {/* 分类筛选 */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                className={`px-4 py-2 rounded-md ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory('all')}
              >
                全部模板
              </button>
              
              {allTemplateCategories.map(category => (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded-md ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 模板网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTemplates().map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          {/* 如果没有模板 */}
          {getTemplates().length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">当前分类没有可用的模板</p>
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