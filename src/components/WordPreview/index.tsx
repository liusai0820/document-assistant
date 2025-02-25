import React, { useEffect, useState, useRef } from 'react';
import DocumentStyles from '../document-styles';
import html2pdf from 'html2pdf.js';

interface WordPreviewProps {
  content: string;
  isLoading?: boolean;
  title?: string;
}

// 中文公文格式化处理函数
const formatDocumentContent = (content: string, title?: string): string => {
  // 清理markdown格式和标记
  const cleanedContent = cleanMarkdownContent(content);
  
  // 识别文档类型
  const documentType = identifyDocumentType(cleanedContent, title);
  
  // 基于文档类型应用特定样式
  let formattedContent = applyDocumentTypeFormatting(cleanedContent, documentType, title);
  
  // 确保HTML格式正确
  formattedContent = ensureValidHtml(formattedContent);
  
  return formattedContent;
};

// 清理Markdown内容
const cleanMarkdownContent = (content: string): string => {
  let cleaned = content || '';
  
  // 处理不同系统的换行符
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 删除markdown标记，但保留其结构意义
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // 粗体
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');     // 斜体
  cleaned = cleaned.replace(/```.*?\n([\s\S]*?)```/g, '$1'); // 代码块
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');       // 行内代码
  
  // 特殊处理标题，确保能正确识别文档结构
  cleaned = cleaned.replace(/^(#+)\s+(.*?)$/gm, (match, hashes, text) => {
    const level = hashes.length;
    if (level === 1) {
      // 一级标题作为文档标题
      return `<h1 class="document-title">${text.trim()}</h1>`;
    } else if (level === 2) {
      // 二级标题作为文档小节标题
      return `<h2 class="document-subtitle">${text.trim()}</h2>`;
    } else if (level === 3) {
      // 三级标题作为段落标题
      return `<h3 class="document-section-title">${text.trim()}</h3>`;
    }
    return text.trim();
  });
  
  cleaned = cleaned.replace(/^\s*>\s+/gm, '');       // 引用
  cleaned = cleaned.replace(/^\s*[*-]\s+/gm, '');    // 无序列表
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');   // 有序列表
  cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // 链接
  cleaned = cleaned.replace(/!\[(.*?)\]\(.*?\)/g, ''); // 图片
  
  // 删除HTML注释（保留特定公文标记）
  const preservedComments = ['红头文件', '发文机关', '发文日期', '主送机关'];
  const commentRegex = /<!--([\s\S]*?)-->/g;
  cleaned = cleaned.replace(commentRegex, (match, commentContent) => {
    for (const keyword of preservedComments) {
      if (commentContent.includes(keyword)) {
        return match; // 保留特定公文标记
      }
    }
    return ''; // 删除其他HTML注释
  });
  
  return cleaned;
};

// 识别文档类型
const identifyDocumentType = (content: string, title?: string): string => {
  if (!content) return 'standard'; // 默认标准文档
  
  // 根据内容和标题判断文档类型
  if (title && (
    title.includes('报告') || 
    title.includes('情况') || 
    content.includes('报告') && content.includes('情况')
  )) {
    return 'report'; // 情况报告类
  }
  
  if (title && (
    title.includes('通知') || 
    title.includes('决定') || 
    title.includes('命令') ||
    title.includes('公告')
  )) {
    return 'notice'; // 通知类
  }
  
  if (title && (
    title.includes('会议') || 
    title.includes('纪要') || 
    content.match(/会议.*纪要/)
  )) {
    return 'minutes'; // 会议纪要
  }
  
  // 检查是否包含红头文件特征
  if (content.includes('红头文件') || content.includes('文号') || content.match(/[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏宁琼].*?[〔［\[【].*?[〕］\]】].*?号/)) {
    return 'red-header'; // 红头文件
  }
  
  // 识别公文类型特征
  const firstParagraph = content.split('\n\n')[0];
  if (firstParagraph && firstParagraph.includes('：') && firstParagraph.length < 100) {
    if (/上报|呈报|请示|申请|表示|建议/.test(firstParagraph)) {
      return 'request'; // 请示类
    }
    
    if (/批复|答复|复函/.test(firstParagraph)) {
      return 'reply'; // 批复类
    }
  }
  
  return 'standard'; // 默认为标准公文
};

// 应用文档类型格式化
const applyDocumentTypeFormatting = (content: string, documentType: string, title?: string): string => {
  const formatted = content;
  let htmlContent = '';
  
  // 添加文档类型特定的容器类
  htmlContent += `<div class="${documentType}-document-container">`;
  
  // 添加文档标题
  if (title && !formatted.includes(`<h1 class="document-title">`)) {
    htmlContent += `<h1 class="document-title">${title}</h1>`;
  }
  
  // 处理文档内容，将段落分开并应用样式
  const paragraphs = formatted.split(/\n{2,}/).filter(p => p.trim().length > 0);
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    
    // 如果段落已经是HTML格式，直接添加
    if (paragraph.startsWith('<h') || paragraph.startsWith('<div') || paragraph.startsWith('<p')) {
      htmlContent += paragraph;
      continue;
    }
    
    // 识别章节标题（如：一、二、三、）
    if (/^[一二三四五六七八九十]+、/.test(paragraph)) {
      htmlContent += `<h2 class="document-subtitle">${paragraph}</h2>`;
      continue;
    }
    
    // 识别二级标题（如：(一)、（二）、（三））
    if (/^[（\(][一二三四五六七八九十]+[）\)]/.test(paragraph)) {
      htmlContent += `<h3 class="document-section-title">${paragraph}</h3>`;
      continue;
    }
    
    // 识别数字标题（如：1.、2.、3.）
    if (/^[0-9]+\./.test(paragraph)) {
      htmlContent += `<h3 class="document-section-title">${paragraph}</h3>`;
      continue;
    }
    
    // 处理特殊情况：主送单位
    if (i === 0 && documentType === 'report' && /市政府|省政府|政府|办公厅|党委|领导小组|委员会|：/.test(paragraph)) {
      htmlContent += `<div class="document-recipient">${paragraph}</div>`;
      continue;
    }
    
    // 处理落款和日期
    if (i === paragraphs.length - 1 || i === paragraphs.length - 2) {
      // 检查是否是日期格式
      if (/^.*?[0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日$/.test(paragraph) || 
          /^.*?[0-9]{4}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{1,2}$/.test(paragraph)) {
        htmlContent += `<div class="document-date">${paragraph}</div>`;
        continue;
      }
      
      // 检查是否是发文机关
      if (paragraph.length < 50 && !paragraph.includes('：')) {
        htmlContent += `<div class="document-sender">${paragraph}</div>`;
        continue;
      }
    }
    
    // 普通段落
    htmlContent += `<p class="document-paragraph">${paragraph}</p>`;
  }
  
  htmlContent += '</div>';
  
  // 应用文档类型特定的样式
  if (documentType === 'red-header') {
    htmlContent = htmlContent.replace('<div class="red-header-document-container">', 
      '<div class="red-header-document-container"><div class="red-header-element"></div>');
  }
  
  return htmlContent;
};

// 确保HTML格式正确
const ensureValidHtml = (html: string): string => {
  return html
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, match => {
      // 保留安全的HTML标签
      const safeElements = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'br', 'hr', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'ul', 'ol', 'li'];
      const element = match.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/i, '$1').toLowerCase();
      
      return safeElements.includes(element) ? match : '';
    })
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;'); // 处理特殊字符
};

// 导出为PDF函数
const exportToPdf = (content: string, title: string): void => {
  // 创建一个临时div来渲染内容
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  tempDiv.className = 'document-container pdf-export';
  document.body.appendChild(tempDiv);
  
  // 配置PDF选项
  const options = {
    margin: [15, 15, 15, 15], // 上右下左边距，单位为mm
    filename: `${title || '文档'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  
  // 导出PDF
  html2pdf()
    .set(options)
    .from(tempDiv)
    .save()
    .then(() => {
      // 导出完成后移除临时div
      document.body.removeChild(tempDiv);
    })
    .catch((error: Error) => {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请稍后重试');
      document.body.removeChild(tempDiv);
    });
};

export const WordPreview: React.FC<WordPreviewProps> = ({ content, isLoading = false, title }) => {
  const [formattedHtml, setFormattedHtml] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  // 格式化内容
  useEffect(() => {
    if (content && !isLoading) {
      // 格式化文档内容
      const formattedContent = formatDocumentContent(content, title);
      setFormattedHtml(formattedContent);
    }
  }, [content, isLoading, title]);

  // 添加导出事件监听
  useEffect(() => {
    const handleExportPdf = (event: CustomEvent) => {
      const documentTitle = event.detail?.title || title || '文档';
      if (previewRef.current) {
        // 从当前渲染的HTML元素导出PDF
        exportToPdf(previewRef.current.innerHTML, documentTitle);
      } else {
        // 如果DOM元素不可用，使用格式化的HTML
        exportToPdf(formattedHtml, documentTitle);
      }
    };

    // 添加事件监听器
    document.addEventListener('export-pdf', handleExportPdf as EventListener);

    // 清理函数
    return () => {
      document.removeEventListener('export-pdf', handleExportPdf as EventListener);
    };
  }, [formattedHtml, title]);

  return (
    <>
      <DocumentStyles />
      
      <div className="word-preview-container">
        <div className="document-preview-container">
          {!isLoading ? (
            <div 
              ref={previewRef} 
              className="document-preview"
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />
          ) : (
            <div className="typing-indicator-container">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        
        <div className="export-buttons">
          <button 
            onClick={() => {
              if (previewRef.current) {
                exportToPdf(previewRef.current.innerHTML, title || '文档');
              } else {
                exportToPdf(formattedHtml, title || '文档');
              }
            }}
            className="export-button"
            disabled={isLoading || !content}
          >
            导出PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default WordPreview; 