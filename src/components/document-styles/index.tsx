import React from 'react';

export interface DocumentFormatSettings {
  titleFont: string;
  headingFont: string;
  subheadingFont: string;
  bodyFont: string;
  fontSize: string;
  alignment: string;
}

const defaultFormat: DocumentFormatSettings = {
  titleFont: '方正小标宋简体',
  headingFont: '黑体',
  subheadingFont: '楷体',
  bodyFont: '仿宋',
  fontSize: '16pt', // 三号字体
  alignment: 'left'
};

interface DocumentStylesProps {
  formatSettings?: Partial<DocumentFormatSettings>;
}

export const DocumentStyles: React.FC<DocumentStylesProps> = ({ formatSettings = {} }) => {
  // 合并默认设置和用户设置
  const format = { ...defaultFormat, ...formatSettings };
  
  // 生成CSS样式
  const styles = `
    /* 文档样式 - 标准公文格式 */
    .document-content {
      color: #000;
      line-height: 1.5;
    }
    
    .document-content h1 {
      font-family: "${format.titleFont}", "方正小标宋简体", "小标宋", "SimSun", "宋体", serif;
      font-size: 22pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 24pt;
      line-height: 1.3;
    }
    
    .document-content h2 {
      font-family: "${format.headingFont}", "SimHei", "黑体", sans-serif;
      font-size: ${format.fontSize};
      font-weight: bold;
      margin-top: 18pt;
      margin-bottom: 12pt;
      line-height: 1.4;
    }
    
    .document-content h3 {
      font-family: "${format.subheadingFont}", "KaiTi", "楷体", serif;
      font-size: ${format.fontSize};
      font-weight: bold;
      margin-top: 16pt;
      margin-bottom: 10pt;
      line-height: 1.4;
    }
    
    .document-content p {
      font-family: "${format.bodyFont}", "FangSong", "仿宋", "仿宋_GB2312", serif;
      font-size: ${format.fontSize};
      line-height: 1.6;
      text-indent: 2em;
      margin-bottom: 10pt;
      text-align: ${format.alignment};
    }
    
    .document-content ul,
    .document-content ol {
      font-family: "${format.bodyFont}", "FangSong", "仿宋", "仿宋_GB2312", serif;
      font-size: ${format.fontSize};
      margin-left: 2em;
      margin-bottom: 10pt;
      padding-left: 1em;
    }
    
    .document-content li {
      text-indent: 0;
      margin-bottom: 5pt;
      line-height: 1.6;
    }
    
    /* 特殊格式 */
    .document-content .main-recipient {
      text-align: left;
      margin-left: 0;
      text-indent: 0;
      font-weight: normal;
    }
    
    .document-content .sender {
      text-align: right;
      margin-top: 20pt;
      margin-right: 0;
      text-indent: 0;
    }
    
    .document-content .date {
      text-align: right;
      margin-right: 0;
      text-indent: 0;
    }
    
    /* 表格样式 */
    .document-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 15pt 0;
      font-family: "${format.bodyFont}", "FangSong", "仿宋", "仿宋_GB2312", serif;
      font-size: ${format.fontSize};
    }
    
    .document-content th,
    .document-content td {
      border: 1px solid #000;
      padding: 8pt;
      text-align: center;
      text-indent: 0;
    }
    
    .document-content th {
      font-weight: bold;
      background-color: #f2f2f2;
    }
  `;
  
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
};

export default DocumentStyles;
