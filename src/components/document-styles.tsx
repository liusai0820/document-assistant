import React from 'react';

// 全局文档样式组件
const DocumentStyles: React.FC = () => {
  return (
    <style jsx global>{`
      /* 基本重置和字体定义 */
      *, *::before, *::after {
        box-sizing: border-box;
      }
      
      /* 公文字体定义 - 使用系统字体作为回退 */
      @font-face {
        font-family: 'OfficialFangSong';
        src: local('FangSong'), local('仿宋'), local('FangSong_GB2312'), local('仿宋_GB2312');
        font-display: swap;
      }
      
      @font-face {
        font-family: 'OfficialSimSun';
        src: local('SimSun'), local('宋体'), local('SimSun-ExtB'), local('NSimSun'), local('新宋体');
        font-display: swap;
      }
      
      @font-face {
        font-family: 'OfficialSimHei';
        src: local('SimHei'), local('黑体');
        font-display: swap;
      }
      
      @font-face {
        font-family: 'OfficialKaiTi';
        src: local('KaiTi'), local('楷体'), local('KaiTi_GB2312'), local('楷体_GB2312');
        font-display: swap;
      }
      
      /* 关闭margin合并，保证精确控制 */
      .word-document-content {
        display: block;
        isolation: isolate;
      }
      
      /* 公文基本容器 */
      .word-preview-container {
        display: flex;
        flex-direction: column;
        background-color: #f8f9fa;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        height: 100%;
        min-height: 600px;
      }
      
      /* 工具栏和状态栏 */
      .word-preview-toolbar, .word-preview-statusbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ddd;
        z-index: 10;
      }
      
      .word-preview-statusbar {
        border-top: 1px solid #ddd;
        border-bottom: none;
        font-size: 12px;
        color: #666;
      }
      
      .word-preview-title {
        font-weight: 500;
        color: #333;
      }
      
      .word-preview-controls {
        display: flex;
        gap: 8px;
      }
      
      .word-control-btn {
        padding: 4px 8px;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: #555;
        cursor: pointer;
      }
      
      .word-control-btn:hover {
        background-color: #e0e0e0;
      }
      
      .word-control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      /* 尺子 */
      .word-preview-ruler {
        height: 20px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ddd;
        position: relative;
        z-index: 10;
      }
      
      .ruler-marks {
        height: 10px;
        width: 100%;
        position: absolute;
        bottom: 0;
        background-image: linear-gradient(90deg, #ccc 1px, transparent 1px);
        background-size: 100px 100%;
      }
      
      /* 文档视图区域 */
      .word-preview-document {
        flex: 1;
        padding: 20px;
        overflow: auto;
        background-color: #e6e6e6;
        display: flex;
        justify-content: center;
      }
      
      /* 公文页面 - A4纸张比例 */
      .word-document-page {
        background-color: white;
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
        width: 210mm; /* A4宽度 */
        min-height: 297mm; /* A4高度 */
        height: auto; /* 允许高度自动扩展 */
        padding: 0;
        margin: 0 auto;
        position: relative;
        overflow: visible; /* 修改为visible，确保内容不被截断 */
      }
      
      /* 公文页边距控制 */
      .document-page-container {
        padding: 40px 60px; /* 公文上下左右页边距 */
        position: relative;
        height: auto; /* 允许高度自动扩展 */
        min-height: 297mm;
        overflow: visible; /* 确保内容不被截断 */
      }
      
      /* 公文内容容器 */
      .document-content-area {
        position: relative;
        width: 100%;
        height: auto; /* 允许高度自动扩展 */
        min-height: 100%;
        font-family: 'OfficialFangSong', FangSong, 仿宋, 仿宋_GB2312, SimSun, 宋体, serif !important;
        font-size: 16pt !important; /* 三号字 */
        line-height: 28pt !important; /* 标准公文行间距 */
        color: #000 !important;
        letter-spacing: 0 !important;
        text-align: justify !important;
        overflow: visible !important; /* 确保内容不被截断 */
        white-space: normal !important; /* 确保正常换行 */
        word-break: normal !important;
        word-wrap: break-word !important;
      }
      
      /* ===== 公文元素样式 ===== */
      
      /* 公文标题 - 居中小2号黑体 */
      .document-title {
        font-family: 'OfficialSimHei', SimHei, 黑体, sans-serif !important;
        font-size: 22pt !important; /* 小2号 */
        font-weight: bold !important;
        text-align: center !important;
        padding: 0 !important;
        margin: 0 0 30pt 0 !important;
        line-height: 1.5 !important;
        letter-spacing: 1px !important;
        display: block !important;
        color: #000 !important;
        clear: both !important;
        float: none !important;
        background: transparent !important;
        border: none !important;
        text-indent: 0 !important;
      }
      
      /* 清除所有可能的浮动或定位影响 */
      .document-content-area * {
        float: none !important;
        position: static !important;
        z-index: auto !important;
        transform: none !important;
      }
      
      /* 情况报告前言和主送单位 */
      .report-document-container .document-paragraph:first-of-type,
      .document-recipient-header {
        text-indent: 0 !important; /* 主送单位不缩进 */
        margin-bottom: 24pt !important; /* 与正文保持较大间距 */
      }
      
      /* 公文落款与日期 */
      .document-footer-content {
        margin-top: 40pt !important;
        text-align: right !important;
        line-height: 28pt !important;
      }
      
      /* 处理特殊文档类型的样式 */
      .red-header-document-container .document-title {
        color: #c00 !important;
        border-bottom: 2px solid #c00 !important;
        padding-bottom: 10pt !important;
      }
      
      /* 报告类文档的样式调整 */
      .report-document-container .document-subtitle {
        font-weight: bold !important;
      }
      
      /* 会议纪要特殊样式 */
      .minutes-document-container .meeting-info {
        margin: 20pt 0 !important;
        line-height: 24pt !important;
      }
      
      /* 情况报告特有的主送单位样式 - 仿宋三号左对齐 */
      .document-recipient-header {
        font-family: 'OfficialFangSong', FangSong, 仿宋, 仿宋_GB2312, SimSun, 宋体, serif !important;
        font-size: 16pt !important; /* 三号 */
        text-align: left !important;
        padding: 0 !important;
        margin: 0 0 20pt 0 !important;
        line-height: 28pt !important;
        display: block !important;
        color: #000 !important;
      }
      
      /* 正文段落 - 三号仿宋，首行缩进2字符 */
      .document-paragraph {
        font-family: 'OfficialFangSong', FangSong, 仿宋, 仿宋_GB2312, SimSun, 宋体, serif !important;
        font-size: 16pt !important; /* 三号 */
        text-indent: 2em !important;
        line-height: 28pt !important;
        margin: 0 0 12pt 0 !important; /* 段落间距适中 */
        padding: 0 !important;
        text-align: justify !important;
        display: block !important;
        color: #000 !important;
      }
      
      /* 一级标题 - 三号黑体 */
      .document-subtitle {
        font-family: 'OfficialSimHei', SimHei, 黑体, sans-serif !important;
        font-size: 16pt !important; /* 三号 */
        font-weight: bold !important;
        margin: 28pt 0 16pt 0 !important;
        padding: 0 !important;
        line-height: 28pt !important;
        text-indent: 0 !important;
        display: block !important;
        color: #000 !important;
      }
      
      /* 二级标题 - 三号黑体 */
      .document-section-title {
        font-family: 'OfficialSimHei', SimHei, 黑体, sans-serif !important;
        font-size: 16pt !important; /* 三号 */
        font-weight: bold !important;
        margin: 16pt 0 16pt 0 !important;
        padding: 0 !important;
        line-height: 28pt !important;
        text-indent: 0 !important;
        display: block !important;
        color: #000 !important;
      }
      
      /* 序号如"一、"等 */
      .document-serial-number {
        font-family: 'OfficialSimHei', SimHei, 黑体, sans-serif;
        font-weight: bold;
        font-size: 16pt; /* 三号 */
      }
      
      /* 红头文件样式 */
      .red-header-document {
        color: #c00 !important;
        font-weight: bold !important;
        font-family: 'OfficialSimSun', SimSun, 宋体, serif !important;
        font-size: 26pt !important; /* 大标宋 */
        text-align: center !important;
        margin: 0 0 30pt 0 !important;
        padding: 0 0 10pt 0 !important;
        line-height: 1.5 !important;
        border-bottom: 2px solid #c00 !important;
        display: block !important;
      }
      
      /* 落款、发文机关样式 */
      .document-sender {
        font-family: 'OfficialFangSong', FangSong, 仿宋, 仿宋_GB2312, SimSun, 宋体, serif !important;
        font-size: 16pt !important; /* 三号 */
        text-align: right !important;
        margin: 28pt 0 0 0 !important;
        padding: 0 !important;
        line-height: 28pt !important;
        display: block !important;
        color: #000 !important;
      }
      
      /* 发文日期样式 */
      .document-date {
        font-family: 'OfficialFangSong', FangSong, 仿宋, 仿宋_GB2312, SimSun, 宋体, serif !important;
        font-size: 16pt !important; /* 三号 */
        text-align: right !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: 28pt !important;
        display: block !important;
        color: #000 !important;
      }
      
      /* 收文单位样式 */
      .document-recipient {
        font-family: 'OfficialFangSong', FangSong, 仿宋, 仿宋_GB2312, SimSun, 宋体, serif;
        font-size: 16pt; /* 三号 */
        margin: 0 0 28pt 0;
        padding: 0;
        line-height: 28pt;
        display: block;
      }
      
      /* 公文表格样式 */
      .document-table {
        width: 100%;
        border-collapse: collapse;
        margin: 16pt 0;
        font-family: 'OfficialFangSong', FangSong, 仿宋, 仿宋_GB2312, SimSun, 宋体, serif;
        font-size: 14pt; /* 四号 */
        line-height: 22pt;
      }
      
      .document-table-header {
        background-color: transparent;
      }
      
      .document-table-header-cell, .document-table-cell {
        border: 1px solid #000;
        padding: 6pt 8pt;
        text-align: center;
        vertical-align: middle;
      }
      
      /* 确保内容区的所有子元素都正确显示 */
      .document-content-area p, 
      .document-content-area div, 
      .document-content-area span, 
      .document-content-area h1, 
      .document-content-area h2, 
      .document-content-area h3, 
      .document-content-area h4, 
      .document-content-area h5, 
      .document-content-area h6 {
        display: block; /* 确保所有元素为块级 */
        word-break: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
      }
      
      /* 强制所有元素应用字体 */
      .document-content-area * {
        font-family: inherit;
      }
      
      /* 状态栏项目 */
      .statusbar-item {
        display: flex;
        align-items: center;
      }
      
      /* 加载动画 */
      .typing-indicator {
        display: flex;
        justify-content: center;
        padding: 20px 0;
      }
      
      .typing-indicator span {
        height: 10px;
        width: 10px;
        background-color: #3498db;
        border-radius: 50%;
        display: inline-block;
        margin: 0 3px;
        opacity: 0.6;
        animation: typing 1s infinite ease-in-out;
      }
      
      .typing-indicator span:nth-child(1) { animation-delay: 0s; }
      .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
      .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
      
      @keyframes typing {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }
      
      /* 光标动画 */
      .cursor-indicator {
        display: inline-block;
        width: 2px;
        height: 18px;
        background-color: #000;
        position: absolute;
        bottom: 50px;
        right: 70px;
        animation: blink 1s infinite;
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      
      /* 打印样式优化 */
      @media print {
        .word-preview-container {
          background-color: white;
          box-shadow: none;
        }
        
        .word-preview-toolbar,
        .word-preview-ruler,
        .word-preview-statusbar {
          display: none;
        }
        
        .word-preview-document {
          padding: 0;
          overflow: visible;
          background-color: white;
        }
        
        .word-document-page {
          box-shadow: none;
          width: 100%;
          height: auto;
        }
      }

      /* 添加CKEditor专用样式 */
      .ckeditor-container {
        width: 100%;
        max-width: 210mm; /* A4纸宽度 */
        margin: 0 auto;
        background-color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        min-height: 297mm; /* A4纸高度 */
      }

      .ckeditor-toolbar {
        padding: 8px;
        background-color: #f7f7f7;
        border-bottom: 1px solid #ddd;
        border-top: 1px solid #ddd;
        margin-bottom: 20px;
      }

      .document-editor {
        font-family: "SimSun", "宋体", serif !important;
        font-size: 14px !important;
        line-height: 1.8 !important;
        color: #333333 !important;
        padding: 15mm !important;
      }

      .document-container {
        padding: 2em;
        position: relative;
      }

      .red-header-element {
        height: 15mm;
        background-color: #e53935;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      }

      .document-title {
        font-weight: bold !important;
        font-size: 22px !important;
        text-align: center !important;
        margin: 20px 0 30px !important;
        line-height: 1.5 !important;
      }

      .document-subtitle {
        font-weight: bold !important;
        font-size: 18px !important;
        margin: 15px 0 !important;
        line-height: 1.5 !important;
      }

      .document-section-title {
        font-weight: normal !important;
        font-size: 16px !important;
        margin: 10px 0 !important;
        line-height: 1.5 !important;
      }

      .document-paragraph {
        text-indent: 2em !important;
        line-height: 1.8 !important;
        margin: 10px 0 !important;
      }

      .document-recipient {
        margin: 15px 0 20px !important;
        line-height: 1.8 !important;
      }

      .document-date {
        text-align: right !important;
        margin: 30px 0 20px !important;
      }

      .export-buttons {
        margin-top: 20px;
        text-align: center;
      }

      .export-button {
        background-color: #1976d2;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin: 0 5px;
      }

      .export-button:hover {
        background-color: #1565c0;
      }

      .export-button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .typing-indicator-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
      }

      /* PDF导出样式优化 */
      .pdf-export {
        font-family: "SimSun", "宋体", serif !important;
        color: #000 !important;
      }

      .pdf-export h1 {
        font-size: 22px !important;
        font-weight: bold !important;
        text-align: center !important;
        margin: 20px 0 30px !important;
      }

      .pdf-export h2 {
        font-size: 18px !important;
        font-weight: bold !important;
        margin: 15px 0 !important;
      }

      .pdf-export h3 {
        font-size: 16px !important;
        font-weight: normal !important;
        margin: 10px 0 !important;
      }

      .pdf-export p {
        text-indent: 2em !important;
        line-height: 1.8 !important;
        margin: 10px 0 !important;
      }

      @media print {
        .document-container {
          margin: 0;
          padding: 0;
        }
      }

      /* 文档预览容器样式 */
      .document-preview-container {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-height: 70vh;
        overflow-y: auto;
        margin-bottom: 20px;
      }

      .document-preview {
        background-color: white;
        padding: 40px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        font-family: 'SimSun', '宋体', serif;
        line-height: 1.8;
        position: relative;
      }

      /* 改进的公文标题样式 */
      .document-preview .document-title {
        font-family: 'SimHei', '黑体', sans-serif;
        font-size: 22pt;
        font-weight: bold;
        text-align: center;
        margin: 0 0 30px 0;
        line-height: 1.5;
        color: #000;
      }

      /* 改进的一级标题样式（一、二、三、） */
      .document-preview .document-subtitle {
        font-family: 'SimHei', '黑体', sans-serif;
        font-size: 16pt;
        font-weight: bold;
        margin: 20px 0 15px 0;
        line-height: 1.5;
        text-indent: 0;
        color: #000;
      }

      /* 改进的二级标题样式（（一）（二）（三）） */
      .document-preview .document-section-title {
        font-family: 'SimSun', '宋体', serif;
        font-size: 16pt;
        margin: 15px 0;
        line-height: 1.5;
        text-indent: 0;
        color: #000;
      }

      /* 改进的段落样式 */
      .document-preview .document-paragraph {
        font-family: 'SimSun', '宋体', serif;
        font-size: 16pt;
        text-indent: 2em;
        line-height: 1.8;
        margin: 0 0 10px 0;
        text-align: justify;
        color: #000;
      }

      /* 收件人样式 */
      .document-preview .document-recipient {
        font-family: 'SimSun', '宋体', serif;
        font-size: 16pt;
        text-indent: 0;
        line-height: 1.8;
        margin: 0 0 20px 0;
        color: #000;
      }

      /* 日期和落款样式 */
      .document-preview .document-date {
        font-family: 'SimSun', '宋体', serif;
        font-size: 16pt;
        text-align: right;
        margin: 30px 0 0 0;
        line-height: 1.8;
        color: #000;
      }

      /* 红头文件特殊样式 */
      .document-preview .red-header-element {
        height: 15mm;
        background-color: #e53935;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      }

      /* 打印优化 */
      @media print {
        .document-preview-container {
          padding: 0;
          box-shadow: none;
          max-height: none;
          overflow: visible;
        }

        .document-preview {
          box-shadow: none;
          padding: 20mm;
        }
      }

      @media (max-width: 768px) {
        .document-preview {
          width: 100%;
          padding: 20px;
        }
      }
    `}</style>
  );
};

export default DocumentStyles; 