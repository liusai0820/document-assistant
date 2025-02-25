'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ModelSelector from '@/components/ModelSelector';
import FileUploader from '@/components/FileUploader/index';
import WordPreview from '@/components/WordPreview/index';

// 文档类型定义
interface DocumentType {
  id: string;
  name: string;
  description: string;
}

interface DocumentSubtype {
  id: string;
  name: string;
}

// 预设选项接口
interface PresetOption {
  id: string;
  label: string;
  category: string;
}

// 预设内容接口
interface PresetCategory {
  id: string;
  name: string;
  options: PresetOption[];
}

// 文档类型数据
const documentTypes: DocumentType[] = [
  { id: 'official', name: '公文', description: '正式公文、通知、意见等' },
  { id: 'report', name: '报告', description: '工作报告、调研报告、总结报告' },
  { id: 'plan', name: '计划', description: '工作计划、项目规划、实施方案' },
  { id: 'summary', name: '总结', description: '工作总结、项目总结、会议纪要' },
];

// 公文子类型定义
const documentSubtypes: Record<string, DocumentSubtype[]> = {
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

// 预设选项数据
const presetOptions: Record<string, Record<string, PresetCategory[]>> = {
  official: {
    notice: [
      {
        id: 'purpose',
        name: '通知目的',
        options: [
          { id: 'purpose_1', label: '传达上级指示', category: 'purpose' },
          { id: 'purpose_2', label: '安排部署工作', category: 'purpose' },
          { id: 'purpose_3', label: '通报情况与进展', category: 'purpose' },
          { id: 'purpose_4', label: '宣传政策法规', category: 'purpose' },
        ]
      },
      {
        id: 'content',
        name: '通知内容',
        options: [
          { id: 'content_1', label: '会议安排', category: 'content' },
          { id: 'content_2', label: '培训活动', category: 'content' },
          { id: 'content_3', label: '表彰奖励', category: 'content' },
          { id: 'content_4', label: '工作要求', category: 'content' },
          { id: 'content_5', label: '时间节点', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '正式严肃', category: 'style' },
          { id: 'style_2', label: '简明扼要', category: 'style' },
          { id: 'style_3', label: '平实客观', category: 'style' },
        ]
      }
    ],
    announcement: [
      {
        id: 'purpose',
        name: '公告目的',
        options: [
          { id: 'purpose_1', label: '向公众发布信息', category: 'purpose' },
          { id: 'purpose_2', label: '宣布重要决定', category: 'purpose' },
          { id: 'purpose_3', label: '发布规章制度', category: 'purpose' },
        ]
      },
      {
        id: 'content',
        name: '公告内容',
        options: [
          { id: 'content_1', label: '人事任免', category: 'content' },
          { id: 'content_2', label: '机构调整', category: 'content' },
          { id: 'content_3', label: '评选结果', category: 'content' },
          { id: 'content_4', label: '重要变更', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '庄重正式', category: 'style' },
          { id: 'style_2', label: '简明扼要', category: 'style' },
          { id: 'style_3', label: '客观准确', category: 'style' },
        ]
      }
    ],
    // 为其他公文子类型添加预设选项...
    opinion: [
      {
        id: 'purpose',
        name: '意见目的',
        options: [
          { id: 'purpose_1', label: '提出建议', category: 'purpose' },
          { id: 'purpose_2', label: '表达观点', category: 'purpose' },
          { id: 'purpose_3', label: '解决问题', category: 'purpose' },
        ]
      },
      {
        id: 'content',
        name: '内容重点',
        options: [
          { id: 'content_1', label: '问题分析', category: 'content' },
          { id: 'content_2', label: '对策建议', category: 'content' },
          { id: 'content_3', label: '实施计划', category: 'content' },
          { id: 'content_4', label: '效果预测', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '客观公正', category: 'style' },
          { id: 'style_2', label: '实事求是', category: 'style' },
          { id: 'style_3', label: '论证充分', category: 'style' },
        ]
      }
    ],
    reply: [
      {
        id: 'purpose',
        name: '批复目的',
        options: [
          { id: 'purpose_1', label: '回应请示', category: 'purpose' },
          { id: 'purpose_2', label: '审批申请', category: 'purpose' },
          { id: 'purpose_3', label: '解答问题', category: 'purpose' },
        ]
      },
      {
        id: 'content',
        name: '内容要点',
        options: [
          { id: 'content_1', label: '审批结果', category: 'content' },
          { id: 'content_2', label: '批复理由', category: 'content' },
          { id: 'content_3', label: '实施要求', category: 'content' },
          { id: 'content_4', label: '注意事项', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '严谨准确', category: 'style' },
          { id: 'style_2', label: '依据充分', category: 'style' },
          { id: 'style_3', label: '表述清晰', category: 'style' },
        ]
      }
    ]
  },
  report: {
    work_report: [
      {
        id: 'time_range',
        name: '报告时间范围',
        options: [
          { id: 'time_1', label: '周报', category: 'time_range' },
          { id: 'time_2', label: '月报', category: 'time_range' },
          { id: 'time_3', label: '季报', category: 'time_range' },
          { id: 'time_4', label: '年报', category: 'time_range' },
        ]
      },
      {
        id: 'content',
        name: '内容重点',
        options: [
          { id: 'content_1', label: '工作计划完成情况', category: 'content' },
          { id: 'content_2', label: '工作成绩与亮点', category: 'content' },
          { id: 'content_3', label: '存在问题与不足', category: 'content' },
          { id: 'content_4', label: '下一步工作计划', category: 'content' },
          { id: 'content_5', label: '经验总结与建议', category: 'content' },
        ]
      },
      {
        id: 'data',
        name: '数据展示',
        options: [
          { id: 'data_1', label: '图表数据', category: 'data' },
          { id: 'data_2', label: '量化指标', category: 'data' },
          { id: 'data_3', label: '比较分析', category: 'data' },
        ]
      },
      {
        id: 'style',
        name: '报告风格',
        options: [
          { id: 'style_1', label: '详实客观', category: 'style' },
          { id: 'style_2', label: '重点突出', category: 'style' },
          { id: 'style_3', label: '层次分明', category: 'style' },
        ]
      }
    ],
    research_report: [
      {
        id: 'method',
        name: '调研方法',
        options: [
          { id: 'method_1', label: '问卷调查', category: 'method' },
          { id: 'method_2', label: '访谈走访', category: 'method' },
          { id: 'method_3', label: '实地考察', category: 'method' },
          { id: 'method_4', label: '文献研究', category: 'method' },
        ]
      },
      {
        id: 'content',
        name: '内容重点',
        options: [
          { id: 'content_1', label: '调研背景与目的', category: 'content' },
          { id: 'content_2', label: '调研过程与方法', category: 'content' },
          { id: 'content_3', label: '调研数据与发现', category: 'content' },
          { id: 'content_4', label: '分析结论', category: 'content' },
          { id: 'content_5', label: '建议措施', category: 'content' },
        ]
      },
      {
        id: 'data',
        name: '数据呈现',
        options: [
          { id: 'data_1', label: '图表分析', category: 'data' },
          { id: 'data_2', label: '案例分析', category: 'data' },
          { id: 'data_3', label: '对比研究', category: 'data' },
        ]
      }
    ],
    // 为其他报告子类型添加预设选项...
    summary_report: [
      {
        id: 'content',
        name: '内容重点',
        options: [
          { id: 'content_1', label: '总体情况概述', category: 'content' },
          { id: 'content_2', label: '主要成果与亮点', category: 'content' },
          { id: 'content_3', label: '经验总结', category: 'content' },
          { id: 'content_4', label: '问题与不足', category: 'content' },
          { id: 'content_5', label: '后续工作建议', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '报告风格',
        options: [
          { id: 'style_1', label: '全面系统', category: 'style' },
          { id: 'style_2', label: '客观分析', category: 'style' },
          { id: 'style_3', label: '总结提炼', category: 'style' },
        ]
      }
    ],
    inspection_report: [
      {
        id: 'content',
        name: '内容重点',
        options: [
          { id: 'content_1', label: '考察背景与目的', category: 'content' },
          { id: 'content_2', label: '考察对象介绍', category: 'content' },
          { id: 'content_3', label: '考察过程', category: 'content' },
          { id: 'content_4', label: '考察发现与体会', category: 'content' },
          { id: 'content_5', label: '借鉴意义与启示', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '报告风格',
        options: [
          { id: 'style_1', label: '实事求是', category: 'style' },
          { id: 'style_2', label: '详细客观', category: 'style' },
          { id: 'style_3', label: '有感而发', category: 'style' },
        ]
      }
    ]
  },
  plan: {
    work_plan: [
      {
        id: 'period',
        name: '计划周期',
        options: [
          { id: 'period_1', label: '周计划', category: 'period' },
          { id: 'period_2', label: '月计划', category: 'period' },
          { id: 'period_3', label: '季度计划', category: 'period' },
          { id: 'period_4', label: '年度计划', category: 'period' },
        ]
      },
      {
        id: 'goal',
        name: '目标设定',
        options: [
          { id: 'goal_1', label: '总体目标', category: 'goal' },
          { id: 'goal_2', label: '阶段目标', category: 'goal' },
          { id: 'goal_3', label: '具体指标', category: 'goal' },
        ]
      },
      {
        id: 'content',
        name: '内容要素',
        options: [
          { id: 'content_1', label: '工作任务', category: 'content' },
          { id: 'content_2', label: '责任分工', category: 'content' },
          { id: 'content_3', label: '时间节点', category: 'content' },
          { id: 'content_4', label: '保障措施', category: 'content' },
          { id: 'content_5', label: '考核评估', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '明确具体', category: 'style' },
          { id: 'style_2', label: '系统全面', category: 'style' },
          { id: 'style_3', label: '条理清晰', category: 'style' },
        ]
      }
    ],
    project_plan: [
      {
        id: 'type',
        name: '项目类型',
        options: [
          { id: 'type_1', label: '建设项目', category: 'type' },
          { id: 'type_2', label: '研发项目', category: 'type' },
          { id: 'type_3', label: '活动项目', category: 'type' },
          { id: 'type_4', label: '改革项目', category: 'type' },
        ]
      },
      {
        id: 'content',
        name: '计划要素',
        options: [
          { id: 'content_1', label: '项目背景', category: 'content' },
          { id: 'content_2', label: '目标定义', category: 'content' },
          { id: 'content_3', label: '范围界定', category: 'content' },
          { id: 'content_4', label: '进度安排', category: 'content' },
          { id: 'content_5', label: '资源配置', category: 'content' },
          { id: 'content_6', label: '风险管理', category: 'content' },
          { id: 'content_7', label: '评估机制', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '详实全面', category: 'style' },
          { id: 'style_2', label: '逻辑严密', category: 'style' },
          { id: 'style_3', label: '可操作性强', category: 'style' },
        ]
      }
    ],
    // 为其他计划子类型添加预设选项...
    implementation_plan: [
      {
        id: 'content',
        name: '内容要素',
        options: [
          { id: 'content_1', label: '方案背景', category: 'content' },
          { id: 'content_2', label: '实施目标', category: 'content' },
          { id: 'content_3', label: '实施步骤', category: 'content' },
          { id: 'content_4', label: '组织保障', category: 'content' },
          { id: 'content_5', label: '资金安排', category: 'content' },
          { id: 'content_6', label: '进度控制', category: 'content' },
          { id: 'content_7', label: '考核评估', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '方案可行', category: 'style' },
          { id: 'style_2', label: '措施得力', category: 'style' },
          { id: 'style_3', label: '操作性强', category: 'style' },
        ]
      }
    ]
  },
  summary: {
    work_summary: [
      {
        id: 'period',
        name: '总结周期',
        options: [
          { id: 'period_1', label: '月度总结', category: 'period' },
          { id: 'period_2', label: '季度总结', category: 'period' },
          { id: 'period_3', label: '年度总结', category: 'period' },
          { id: 'period_4', label: '项目总结', category: 'period' },
        ]
      },
      {
        id: 'content',
        name: '内容重点',
        options: [
          { id: 'content_1', label: '工作回顾', category: 'content' },
          { id: 'content_2', label: '成绩与成果', category: 'content' },
          { id: 'content_3', label: '问题与不足', category: 'content' },
          { id: 'content_4', label: '经验与教训', category: 'content' },
          { id: 'content_5', label: '改进方向', category: 'content' },
        ]
      },
      {
        id: 'data',
        name: '成果展示',
        options: [
          { id: 'data_1', label: '量化数据', category: 'data' },
          { id: 'data_2', label: '质化描述', category: 'data' },
          { id: 'data_3', label: '对比分析', category: 'data' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '客观全面', category: 'style' },
          { id: 'style_2', label: '深入分析', category: 'style' },
          { id: 'style_3', label: '总结提炼', category: 'style' },
        ]
      }
    ],
    project_summary: [
      {
        id: 'content',
        name: '内容重点',
        options: [
          { id: 'content_1', label: '项目概况', category: 'content' },
          { id: 'content_2', label: '实施过程', category: 'content' },
          { id: 'content_3', label: '取得成效', category: 'content' },
          { id: 'content_4', label: '存在问题', category: 'content' },
          { id: 'content_5', label: '经验启示', category: 'content' },
          { id: 'content_6', label: '后续建议', category: 'content' },
        ]
      },
      {
        id: 'data',
        name: '成果展示',
        options: [
          { id: 'data_1', label: '项目指标完成情况', category: 'data' },
          { id: 'data_2', label: '资源使用情况', category: 'data' },
          { id: 'data_3', label: '效益分析', category: 'data' },
        ]
      },
      {
        id: 'style',
        name: '文风要求',
        options: [
          { id: 'style_1', label: '客观评价', category: 'style' },
          { id: 'style_2', label: '重点突出', category: 'style' },
          { id: 'style_3', label: '数据支撑', category: 'style' },
        ]
      }
    ],
    meeting_minutes: [
      {
        id: 'type',
        name: '会议类型',
        options: [
          { id: 'type_1', label: '例行会议', category: 'type' },
          { id: 'type_2', label: '专题会议', category: 'type' },
          { id: 'type_3', label: '研讨会', category: 'type' },
          { id: 'type_4', label: '决策会', category: 'type' },
        ]
      },
      {
        id: 'content',
        name: '记录内容',
        options: [
          { id: 'content_1', label: '会议议程', category: 'content' },
          { id: 'content_2', label: '参会人员', category: 'content' },
          { id: 'content_3', label: '主要发言', category: 'content' },
          { id: 'content_4', label: '讨论要点', category: 'content' },
          { id: 'content_5', label: '决议事项', category: 'content' },
          { id: 'content_6', label: '后续安排', category: 'content' },
        ]
      },
      {
        id: 'style',
        name: '记录方式',
        options: [
          { id: 'style_1', label: '详细记录', category: 'style' },
          { id: 'style_2', label: '要点记录', category: 'style' },
          { id: 'style_3', label: '规范格式', category: 'style' },
        ]
      }
    ]
  }
};

export default function CreateDocument() {
  const searchParams = useSearchParams();
  
  // 状态管理
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [customRequirements, setCustomRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.7-sonnet');
  
  // 预设选项状态
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  
  // 增加生成步骤状态
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  
  // 添加文件上传状态
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  
  // 添加缺少的状态变量
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf' | null>(null);
  
  // 在renderPreviewStep函数中替换原来的预览部分
  const renderPreviewStep = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">文档预览</h2>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
              onClick={() => setCurrentStep(2)}
            >
              返回编辑
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              onClick={() => handleExport('docx')}
              disabled={!generatedContent || isExporting}
            >
              {isExporting && exportFormat === 'docx' ? '导出中...' : '导出Word'}
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              onClick={() => handleExport('pdf')}
              disabled={!generatedContent || isExporting}
            >
              {isExporting && exportFormat === 'pdf' ? '导出中...' : '导出PDF'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-250px)]">
          <WordPreview 
            content={generatedContent} 
            isLoading={isGenerating}
            title={docTitle}
          />
        </div>

        {!isGenerating && generatedContent && (
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(generatedContent);
                  alert('内容已复制到剪贴板');
                } catch (err) {
                  console.error('复制失败:', err);
                  alert('复制失败，请手动复制');
                }
              }}
            >
              复制内容
            </button>
            
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              onClick={() => {
                // 保存到本地存储
                try {
                  const savedDocs = localStorage.getItem('savedDocuments');
                  let documents = [];
                  if (savedDocs) {
                    documents = JSON.parse(savedDocs);
                  }
                  
                  const newDoc = {
                    id: Date.now().toString(),
                    title: docTitle,
                    type: selectedType,
                    subtype: selectedSubtype,
                    createdAt: new Date().toISOString(),
                    content: generatedContent
                  };
                  
                  documents.unshift(newDoc);
                  localStorage.setItem('savedDocuments', JSON.stringify(documents));
                  
                  alert('文档已保存');
                } catch (err) {
                  console.error('保存失败:', err);
                  alert('保存失败，请重试');
                }
              }}
            >
              保存文档
            </button>
          </div>
        )}
      </div>
    );
  };

  // 从URL参数中获取文档类型和步骤
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    const stepFromUrl = searchParams.get('step');
    const subtypeFromUrl = searchParams.get('subtype');
    
    if (typeFromUrl && documentTypes.some(type => type.id === typeFromUrl)) {
      setSelectedType(typeFromUrl);
      
      // 如果URL中有子类型，也设置它
      if (subtypeFromUrl && documentSubtypes[typeFromUrl]?.some(subtype => subtype.id === subtypeFromUrl)) {
        setSelectedSubtype(subtypeFromUrl);
      }
      
      // 如果URL中指定了步骤，直接跳到对应步骤
      if (stepFromUrl && !isNaN(Number(stepFromUrl))) {
        setCurrentStep(Number(stepFromUrl));
      }
    }
  }, [searchParams, documentTypes, documentSubtypes]);
  
  // 当文档类型或子类型变化时，重置选中的预设选项
  useEffect(() => {
    setSelectedOptions({});
  }, [selectedType, selectedSubtype]);
  
  // 处理文档类型选择
  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setSelectedSubtype(''); // 重置子类型
  };
  
  // 处理预设选项变化
  const handleOptionChange = (optionId: string, category: string, checked: boolean) => {
    setSelectedOptions(prev => {
      const current = {...prev};
      if (!current[category]) {
        current[category] = [];
      }
      
      if (checked) {
        current[category] = [...current[category], optionId];
      } else {
        current[category] = current[category].filter(id => id !== optionId);
      }
      
      return current;
    });
  };
  
  // 根据选中选项生成内容描述
  const generateContentFromOptions = () => {
    if (!selectedType || !selectedSubtype) return '';
    
    const typePresets = presetOptions[selectedType]?.[selectedSubtype];
    if (!typePresets) return '';
    
    let generatedText = '';
    
    // 遍历所有类别
    typePresets.forEach(category => {
      const selectedForCategory = selectedOptions[category.id] || [];
      if (selectedForCategory.length > 0) {
        // 添加类别标题
        generatedText += `${category.name}：`;
        
        // 查找并添加选中的选项标签
        const selectedLabels = category.options
          .filter(option => selectedForCategory.includes(option.id))
          .map(option => option.label);
        
        generatedText += selectedLabels.join('、');
        generatedText += '。\n';
      }
    });
    
    return generatedText;
  };
  
  // 处理文件上传回调函数
  const handleFileContent = (content: string, fileName: string) => {
    setUploadedContent(content);
    setUploadedFileName(fileName);
    setUploadError('');
  };

  const handleFileError = (error: string) => {
    setUploadError(error);
    setUploadedContent('');
    setUploadedFileName('');
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !selectedSubtype || !docTitle) {
      alert('请填写所有必填字段');
      return;
    }
    
    setIsGenerating(true);
    setGenerationStep('准备生成文档...');
    setGenerationProgress(10);
    setErrorMessage(''); // 清除之前的错误
    
    // 生成预设选项内容
    const presetContent = generateContentFromOptions();
    
    // 组合内容
    const combinedContent = presetContent + 
      (docContent ? `\n其他需求：${docContent}` : '');
    
    try {
      // 模拟思考过程
      setGenerationStep('分析文档需求...');
      setGenerationProgress(20);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setGenerationStep('构建文档结构...');
      setGenerationProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 调用API生成文档
      setGenerationStep('智能生成内容中...');
      setGenerationProgress(60);
      
      console.log('发送生成请求', {
        type: selectedType,
        subtype: selectedSubtype,
        title: docTitle,
        model: selectedModel
      });
      
      // 设置为空字符串，以便流式输出时逐步添加内容
      setGeneratedContent('');
      
      // 使用流式输出API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          subtype: selectedSubtype,
          title: docTitle,
          content: combinedContent,
          requirements: customRequirements,
          model: selectedModel,
          // 启用流式输出
          stream: true,
          // 添加上传的文件内容作为参考材料
          referenceContent: uploadedContent ? `### 参考材料\n以下是上传的参考资料（${uploadedFileName}），请在生成内容时参考这些信息：\n\n${uploadedContent}` : undefined,
          // 如果customRequirements是一个自定义模板内容，则将其作为customPrompt传递
          customPrompt: customRequirements.includes('{title}') ? 
            customRequirements
              .replace('{title}', docTitle)
              .replace('{content}', combinedContent || '')
              .replace('{requirements}', '') : undefined
        })
      });
      
      if (!response.ok) {
        let errorData: { error?: string; suggestion?: string } = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('解析错误响应失败:', e);
        }
        
        const errorMessage = errorData.error || `服务器错误: ${response.status}`;
        const suggestion = errorData.suggestion || '请稍后重试';
        
        // 如果是模型相关错误，提示用户切换模型
        if (response.status === 503 || errorMessage.includes('模型')) {
          throw new Error(`${errorMessage}. ${suggestion}\n建议尝试切换其他模型。`);
        }
        
        throw new Error(`${errorMessage}. ${suggestion}`);
      }
      
      // 进入预览步骤，但此时内容仍在生成中
      setCurrentStep(3);
      setGenerationStep('正在生成内容...');
      setGenerationProgress(70);
      
      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }
      
      const decoder = new TextDecoder();
      let fullContent = '';
      let contentLoadedPercentage = 70;
      let characterCount = 0;
      let receivedError = null;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // 解码收到的数据
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            // 处理 SSE 格式数据
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                // 流结束
                break;
              }
              
              try {
                const parsedData = JSON.parse(data);
                
                // 检查是否有错误信息
                if (parsedData.error) {
                  receivedError = parsedData.error;
                  console.error('流处理中收到错误:', receivedError);
                  continue;
                }
                
                if (parsedData.content) {
                  // 累加内容
                  fullContent += parsedData.content;
                  characterCount += parsedData.content.length;
                  
                  // 更新生成的内容
                  setGeneratedContent(fullContent);
                  
                  // 更新进度，从70%到95%之间
                  if (characterCount > 100) {
                    contentLoadedPercentage = Math.min(95, 70 + characterCount / 100);
                    setGenerationProgress(contentLoadedPercentage);
                  }
                }
              } catch (error) {
                console.warn('无法解析SSE数据:', data, error);
              }
            }
          }
        }
      } catch (error) {
        console.error('流处理出错:', error);
        
        // 如果已经获取了一些内容，但在半路出错，仍然显示已生成的内容
        if (fullContent.length > 0) {
          console.log('生成过程中断，但已有部分内容，长度:', fullContent.length);
          setGeneratedContent(fullContent + '\n\n[注意：内容生成过程被中断，以上为已生成的部分内容]');
        } else {
          throw new Error('内容生成过程中断，请重试');
        }
      } finally {
        reader.releaseLock();
      }
      
      // 如果流处理中收到了错误但有内容，添加提示信息
      if (receivedError && fullContent.length > 0) {
        setGeneratedContent(fullContent + `\n\n[注意：生成过程中出现问题: ${receivedError}]`);
      } else if (receivedError) {
        throw new Error(`生成过程中出现问题: ${receivedError}`);
      }
      
      setGenerationStep('文档生成完成!');
      setGenerationProgress(100);
      
      // 短暂延迟后完成生成过程
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('生成文档时出错:', error);
      setErrorMessage(error instanceof Error ? error.message : '生成文档时出错，请重试');
      
      // 更友好的错误提示UI
      const errorMsg = error instanceof Error ? error.message : '服务暂时不可用，请稍后再试';
      const suggestModelChange = errorMsg.includes('模型') || errorMsg.includes('服务');
      
      // 如果错误与模型相关，但已尝试过生成，则显示预览页面
      if (generatedContent.length > 0) {
        setCurrentStep(3);
      } else {
        // 错误弹窗提示
        alert(`生成文档失败: ${errorMsg}${suggestModelChange ? '\n\n建议: 尝试切换其他AI模型后重试' : ''}`);
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
      setGenerationProgress(0);
    }
  };

  // 渲染预设选项
  const renderPresetOptions = () => {
    if (!selectedType || !selectedSubtype) return null;
    
    const typePresets = presetOptions[selectedType]?.[selectedSubtype];
    if (!typePresets || typePresets.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">选择文档要素</h3>
        <p className="text-sm text-gray-500 mb-4">
          请勾选以下选项，系统将根据您的选择智能生成相应内容
        </p>
        
        <div className="space-y-4">
          {typePresets.map(category => (
            <div key={category.id} className="border rounded-md p-4">
              <h4 className="font-medium text-gray-800 mb-2">{category.name}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {category.options.map(option => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={option.id}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedOptions[category.id]?.includes(option.id) || false}
                      onChange={(e) => handleOptionChange(option.id, category.id, e.target.checked)}
                    />
                    <label htmlFor={option.id} className="ml-2 text-sm text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 获取当前步骤对应的UI组件
  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">第一步：选择文档类型</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {documentTypes.map((type) => (
                <div 
                  key={type.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedType === type.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <h3 className="font-medium text-lg">{type.name}</h3>
                  <p className="text-gray-600 text-sm">{type.description}</p>
                </div>
              ))}
            </div>
            
            {selectedType && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">选择具体类型</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {documentSubtypes[selectedType]?.map((subtype) => (
                    <div
                      key={subtype.id}
                      className={`p-3 border rounded text-center cursor-pointer ${
                        selectedSubtype === subtype.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedSubtype(subtype.id)}
                    >
                      {subtype.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!selectedType || !selectedSubtype}
                onClick={() => setCurrentStep(2)}
              >
                下一步
              </button>
            </div>
          </div>
        );
        
      case 2: // 填写文档内容
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">第二步：填写文档信息</h2>
            
            {isGenerating && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">生成中...</h3>
                  
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">{generationStep}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  文档标题 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="请输入文档标题"
                  required
                />
              </div>
              
              {/* 预设选项区域 */}
              {renderPresetOptions()}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                  补充内容（可选）
                </label>
                <textarea
                  id="content"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="请输入其他需要补充的内容"
                />
              </div>
              
              {/* 个性化要求输入 */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements">
                  个性化要求（可选）
                </label>
                <textarea
                  id="requirements"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="请填写个性化要求，如文风、格式、特殊内容等"
                />
              </div>

              {/* 文件上传区域 */}
              <div className="mb-6">
                <FileUploader
                  onFileContent={handleFileContent}
                  onError={handleFileError}
                  label="上传参考材料（可选）"
                  accept=".txt,.docx,.pdf,.md,.html"
                />
                
                {uploadedFileName && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">已上传:</span> {uploadedFileName}
                    </p>
                    {uploadedContent && (
                      <details className="mt-1">
                        <summary className="text-xs text-green-600 cursor-pointer hover:underline">
                          查看提取的内容预览
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-32 overflow-y-auto">
                          {uploadedContent.substring(0, 500)}
                          {uploadedContent.length > 500 && '...'}
                        </div>
                      </details>
                    )}
                  </div>
                )}
                
                {uploadError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">上传失败:</span> {uploadError}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <ModelSelector 
                  onSelectModel={(modelId) => setSelectedModel(modelId)}
                  defaultModel={selectedModel}
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  onClick={() => setCurrentStep(1)}
                >
                  上一步
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isGenerating || !docTitle}
                >
                  {isGenerating ? '生成中...' : '生成文档'}
                </button>
              </div>
            </form>
          </div>
        );
        
      default:
        return renderPreviewStep();
    }
  };

  // 加载和处理模板数据
  useEffect(() => {
    // 处理模板参数
    const templateId = searchParams.get('template');
    if (templateId) {
      // 尝试从localStorage加载自定义模板
      try {
        const storedTemplates = localStorage.getItem('customTemplates');
        if (storedTemplates) {
          const templates = JSON.parse(storedTemplates);
          // 使用正确的类型
          interface TemplateItem {
            id: string;
            content?: string;
          }
          const customTemplate = templates.find((t: TemplateItem) => t.id === templateId);
          
          // 如果找到自定义模板，设置模板内容作为自定义要求
          if (customTemplate && customTemplate.content) {
            setCustomRequirements(customTemplate.content);
          }
        }
      } catch (error) {
        console.error('加载模板失败:', error);
      }
    }
  }, [searchParams]);

  // 修改handleExport函数
  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!generatedContent) return;
    
    setIsExporting(true);
    setExportFormat(format);
    
    try {
      // 创建导出请求
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedContent,
          format: format,
          title: docTitle
        })
      });
      
      if (!response.ok) {
        throw new Error('导出失败');
      }
      
      // 获取blob数据
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${docTitle || '文档'}.${format}`;
      
      // 触发下载
      window.document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('导出文档出错:', error);
      alert(`导出${format === 'docx' ? 'Word' : 'PDF'}失败，请重试`);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
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
              <Link href="/templates" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                模板中心
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 步骤指示器 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        currentStep === step 
                          ? 'bg-blue-600' 
                          : currentStep > step 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className="mt-2 text-sm text-gray-600">
                    {step === 1 ? '选择类型' : step === 2 ? '填写信息' : '预览导出'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-0">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} 
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* 当前步骤内容 */}
          {getStepContent()}
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