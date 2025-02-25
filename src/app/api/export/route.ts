import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { chineseFonts } from 'pdfmake-chinese';

// 确保pdfMake使用内置的字体
// 使用类型断言处理
interface PDFMakeWithVFS {
  vfs: Record<string, string>;
  createPdf: (documentDefinition: Record<string, unknown>) => {
    getBuffer: (callback: (buffer: Uint8Array) => void) => void;
  };
}

// 修复pdfFonts导入问题
const pdfMakeWithVfs = pdfMake as unknown as PDFMakeWithVFS;
// 使用中文字体包
try {
  // 尝试使用中文字体包
  pdfMakeWithVfs.vfs = chineseFonts.vfs;
  console.log('成功加载中文字体包');
} catch (error) {
  // 回退到标准字体
  console.warn('无法加载中文字体包，尝试使用标准字体:', error);
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMakeWithVfs.vfs = pdfFonts.pdfMake.vfs;
  } else {
    console.warn('无法读取pdfFonts.pdfMake.vfs, 使用默认空对象');
    pdfMakeWithVfs.vfs = {}; // 使用空对象防止报错
  }
}

// 最大内容长度，超过此长度的内容将被分块处理
const MAX_CONTENT_LENGTH = 50000;

export async function POST(request: Request) {
  try {
    console.log('收到导出请求');
    // 解析请求体
    const { content, format, title } = await request.json();

    console.log(`收到导出请求: 格式=${format}, 标题=${title}, 内容长度=${content?.length || 0}`);

    // 验证必填字段
    if (!content || !format) {
      return NextResponse.json({ error: '缺少必要的参数' }, { status: 400 });
    }

    // 生成安全的文件名
    const safeTitle = title ? title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') : '文档';
    
    // 如果内容太大，分块处理
    let processedContent = content;
    if (content.length > MAX_CONTENT_LENGTH) {
      console.log(`内容长度超过最大限制(${MAX_CONTENT_LENGTH})，将进行分块处理`);
      // 只处理内容的前部分，避免处理失败
      processedContent = content.substring(0, MAX_CONTENT_LENGTH) + "\n\n...(内容过长，已截断)";
    }
    
    // 解析Markdown内容为结构化数据
    const contentStructure = parseMarkdownContent(processedContent);
    
    if (format.toLowerCase() === 'docx') {
      try {
        console.log('准备生成Word文档');
        
        // 创建一个新的Word文档
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              // 添加标题
              new Paragraph({
                text: title,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 200,
                },
              }),
              
              // 添加内容
              ...generateDocxContent(contentStructure)
            ],
          }],
          styles: {
            paragraphStyles: [
              {
                id: 'Normal',
                name: 'Normal',
                run: {
                  font: 'FangSong, 仿宋, 仿宋_GB2312', // 使用仿宋并添加更多兼容字体
                  size: 32, // 16pt = 32半磅，三号字
                },
                paragraph: {
                  spacing: {
                    line: 420, // 28磅行距 = 420扭曲单位
                  },
                  indent: {
                    firstLine: 480, // 首行缩进2字符
                  },
                  alignment: AlignmentType.JUSTIFIED, // 两端对齐
                },
              },
              {
                id: 'Heading1',
                name: 'Heading 1',
                run: {
                  font: 'SimHei, 黑体', // 使用黑体替代宋体，并添加兼容字体
                  size: 44,  // 22pt = 44半磅
                  bold: true,
                },
                paragraph: {
                  spacing: {
                    before: 240,
                    after: 240,
                  },
                  alignment: AlignmentType.CENTER,
                },
              },
              {
                id: 'Heading2',
                name: 'Heading 2',
                run: {
                  font: 'KaiTi', // 楷体
                  size: 36,  // 18pt = 36半磅
                  bold: true,
                },
                paragraph: {
                  spacing: {
                    before: 240,
                    after: 120,
                  },
                },
              },
              {
                id: 'Heading3',
                name: 'Heading 3',
                run: {
                  font: 'KaiTi', // 楷体
                  size: 32,  // 16pt = 32半磅
                  bold: true,
                },
                paragraph: {
                  spacing: {
                    before: 200,
                    after: 100,
                  },
                },
              },
            ],
          },
        });
        
        // 生成文档buffer
        const buffer = await Packer.toBuffer(doc);
        
        console.log('Word文档生成成功，大小:', buffer.byteLength, '字节');
        
        // 返回文档数据和文件名，以便前端下载
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(safeTitle)}.docx"`,
          },
        });
      } catch (error: unknown) {
        console.error('Word文档生成错误:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        throw new Error(`Word文档生成失败: ${errorMessage}`);
      }
    } 
    else if (format.toLowerCase() === 'pdf') {
      try {
        console.log('准备生成PDF文档');
        
        // 创建文档定义
        const docDefinition: Record<string, unknown> = {
          info: {
            title: title,
            author: '公文写作助手',
            subject: '公文文档',
            keywords: '公文,文档,报告',
          },
          pageSize: 'A4',
          pageMargins: [72, 72, 72, 72], // 左，上，右，下，单位: 点
          content: [
            // 标题
            { text: title, style: 'header', alignment: 'center' },
            // 内容
            ...generatePdfContent(contentStructure)
          ],
          defaultStyle: {
            font: 'FangSong', // 使用仿宋作为默认字体
            fontSize: 16, // 三号字
            lineHeight: 2.33, // 28磅/12pt = 2.33
            alignment: 'justify', // 两端对齐
          },
          styles: {
            header: {
              fontSize: 22, // 小二号
              bold: true,
              font: 'SimSun', // 宋体
              margin: [0, 0, 0, 20],
              alignment: 'center',
            },
            heading1: {
              fontSize: 18, // 小三号
              bold: true,
              font: 'SimSun', // 宋体
              margin: [0, 20, 0, 10],
              alignment: 'center',
            },
            heading2: {
              fontSize: 16, // 三号
              bold: true,
              font: 'KaiTi', // 楷体
              margin: [0, 15, 0, 5],
            },
            heading3: {
              fontSize: 16, // 三号
              bold: true,
              font: 'KaiTi', // 楷体
              margin: [0, 10, 0, 5],
            },
            paragraph: {
              fontSize: 16, // 三号
              font: 'FangSong', // 仿宋
              margin: [32, 5, 0, 10], // 左缩进2字符，约32pt
              lineHeight: 2.33, // 28磅行距
              alignment: 'justify', // 两端对齐
            },
          },
          // 注册使用的中文字体
          fonts: {
            SimSun: {
              normal: 'SimSun',
              bold: 'SimSun',
              italics: 'SimSun',
              bolditalics: 'SimSun'
            },
            SimHei: {
              normal: 'SimHei',
              bold: 'SimHei',
              italics: 'SimHei',
              bolditalics: 'SimHei'
            },
            KaiTi: {
              normal: 'KaiTi',
              bold: 'KaiTi',
              italics: 'KaiTi',
              bolditalics: 'KaiTi'
            },
            FangSong: {
              normal: 'FangSong',
              bold: 'FangSong',
              italics: 'FangSong',
              bolditalics: 'FangSong'
            }
          }
        };
        
        try {
          // 创建PDF
          const pdfDoc = pdfMakeWithVfs.createPdf(docDefinition);
          
          // 获取PDF Buffer
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            pdfDoc.getBuffer((buffer: Uint8Array) => {
              try {
                resolve(Buffer.from(buffer));
              } catch (err) {
                reject(err);
              }
            });
          });
          
          console.log('PDF文档生成成功');
          
          // 返回PDF数据和文件名，以便前端下载
          return new Response(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${encodeURIComponent(safeTitle)}.pdf"`,
            },
          });
        } catch (pdfError) {
          console.error('PDF生成内部错误:', pdfError);
          throw new Error(`PDF生成内部错误: ${pdfError instanceof Error ? pdfError.message : '未知错误'}`);
        }
      } catch (error: unknown) {
        console.error('PDF生成错误:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        throw new Error(`PDF生成失败: ${errorMessage}`);
      }
    }
    
    return NextResponse.json({ error: '不支持的导出格式' }, { status: 400 });
  } catch (error: unknown) {
    console.error('导出文档出错:', error);
    return NextResponse.json({ 
      error: '导出文档失败', 
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// 结构化内容项接口
interface ContentItem {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list';
  text: string;
  items?: string[]; // 用于列表
}

// 生成Word文档内容
function generateDocxContent(contentItems: ContentItem[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  for (const item of contentItems) {
    if (item.type === 'heading1') {
      paragraphs.push(new Paragraph({
        text: item.text,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 240,
          after: 120,
        },
      }));
    } else if (item.type === 'heading2') {
      paragraphs.push(new Paragraph({
        text: item.text,
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 200,
          after: 100,
        },
      }));
    } else if (item.type === 'heading3') {
      paragraphs.push(new Paragraph({
        text: item.text,
        heading: HeadingLevel.HEADING_3,
        spacing: {
          before: 160,
          after: 80,
        },
      }));
    } else if (item.type === 'paragraph') {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: item.text,
          }),
        ],
        indent: {
          firstLine: 480, // 首行缩进2字符
        },
        spacing: {
          line: 360, // 1.5倍行距
          after: 120,
        },
      }));
    } else if (item.type === 'list' && item.items && item.items.length > 0) {
      // 处理列表项
      for (const listItem of item.items) {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: `• ${listItem}`,
            }),
          ],
          indent: {
            left: 480, // 左缩进
          },
          spacing: {
            line: 360, // 1.5倍行距
            after: 80,
          },
        }));
      }
    }
  }
  
  return paragraphs;
}

// 生成PDF文档内容
function generatePdfContent(contentItems: ContentItem[]): Array<Record<string, unknown>> {
  const pdfContent: Array<Record<string, unknown>> = [];
  
  for (const item of contentItems) {
    if (item.type === 'heading1') {
      pdfContent.push({ 
        text: item.text, 
        style: 'heading1', 
        alignment: 'center',
        margin: [0, 20, 0, 10] 
      });
    } else if (item.type === 'heading2') {
      pdfContent.push({ 
        text: item.text, 
        style: 'heading2', 
        margin: [0, 15, 0, 5] 
      });
    } else if (item.type === 'heading3') {
      pdfContent.push({ 
        text: item.text, 
        style: 'heading3', 
        margin: [0, 10, 0, 5] 
      });
    } else if (item.type === 'paragraph') {
      pdfContent.push({ 
        text: item.text, 
        style: 'paragraph', 
        alignment: 'justify',
        margin: [20, 0, 0, 10]
      });
    } else if (item.type === 'list' && item.items && item.items.length > 0) {
      pdfContent.push({ 
        ul: item.items,
        style: 'paragraph',
        margin: [40, 5, 0, 10]
      });
    }
  }
  
  return pdfContent;
}

// 解析Markdown内容为结构化数据
function parseMarkdownContent(markdown: string): ContentItem[] {
  // 确保markdown是字符串
  if (typeof markdown !== 'string') {
    markdown = String(markdown || '');
  }
  
  // 分割成行
  const lines = markdown.split('\n');
  const result: ContentItem[] = [];
  let currentListItems: string[] = [];
  let isInList = false;
  
  // 逐行处理
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 忽略空行
    if (!line) {
      // 如果正在处理列表，完成当前列表
      if (isInList && currentListItems.length > 0) {
        result.push({
          type: 'list',
          text: '',
          items: [...currentListItems],
        });
        currentListItems = [];
        isInList = false;
      }
      continue;
    }
    
    // 处理标题
    if (line.startsWith('# ')) {
      result.push({
        type: 'heading1',
        text: line.substring(2),
      });
    } else if (line.startsWith('## ')) {
      result.push({
        type: 'heading2',
        text: line.substring(3),
      });
    } else if (line.startsWith('### ')) {
      result.push({
        type: 'heading3',
        text: line.substring(4),
      });
    } 
    // 处理列表项
    else if (line.match(/^[\-\*\+] /) || line.match(/^\d+\. /)) {
      isInList = true;
      const listItemText = line.replace(/^[\-\*\+] /, '').replace(/^\d+\. /, '');
      currentListItems.push(listItemText);
    }
    // 处理普通段落
    else {
      // 如果正在处理列表，且遇到非列表项，完成当前列表
      if (isInList && currentListItems.length > 0) {
        result.push({
          type: 'list',
          text: '',
          items: [...currentListItems],
        });
        currentListItems = [];
        isInList = false;
      }
      
      result.push({
        type: 'paragraph',
        text: line,
      });
    }
  }
  
  // 确保处理了最后的列表（如果有）
  if (isInList && currentListItems.length > 0) {
    result.push({
      type: 'list',
      text: '',
      items: [...currentListItems],
    });
  }
  
  return result;
} 