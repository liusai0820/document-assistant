'use client';

import { useState } from 'react';

// 模型选项
interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
}

// 可用模型列表
const availableModels: ModelOption[] = [
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: '最新Claude模型，优秀的文档生成能力，效率高'
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Google最新模型，高效快速，适合多场景使用'
  },
  {
    id: 'google/gemini-2.0-pro-exp-02-05:free',
    name: 'Gemini 2.0 Pro (免费)',
    provider: 'Google',
    description: 'Google免费模型，高性价比选择'
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: '最强大的公文生成能力，适合正式场合使用'
  },
  {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: '高质量的公文生成，平衡性能与成本'
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'OpenAI最新旗舰模型，综合性能强大'
  }
];

interface ModelSelectorProps {
  onSelectModel: (modelId: string) => void;
  defaultModel?: string;
}

export default function ModelSelector({ onSelectModel, defaultModel = 'anthropic/claude-3.7-sonnet' }: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [isOpen, setIsOpen] = useState(false);

  // 处理模型选择
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    onSelectModel(modelId);
    setIsOpen(false);
  };

  // 获取当前选中的模型信息
  const currentModel = availableModels.find(model => model.id === selectedModel) || availableModels[0];

  return (
    <div className="relative">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          AI模型选择
        </label>
        <button 
          type="button"
          className="flex items-center justify-between w-full p-3 border rounded bg-white hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">{currentModel.name}</span>
            <span className="text-xs text-gray-500">{currentModel.provider}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {availableModels.map((model) => (
            <button
              key={model.id}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex flex-col border-b last:border-b-0 ${
                selectedModel === model.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleSelectModel(model.id)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs bg-gray-200 rounded px-2 py-1">{model.provider}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">{model.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 