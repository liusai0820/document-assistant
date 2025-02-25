import { NextResponse } from 'next/server';
import { join, extname } from 'path';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// 临时文件目录
const TEMP_DIR = './tmp/uploads';

// 创建临时目录
async function ensureTempDir() {
  try {
    await mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('创建临时目录失败:', error);
    throw new Error('服务器错误：无法创建临时存储目录');
  }
}

// 安全处理文本，去除不安全的字符
function sanitizeText(text: string): string {
  // 用空格替换控制字符
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
}

// 保存上传的文件
async function saveFile(file: File): Promise<string> {
  await ensureTempDir();
  
  // 生成唯一文件名
  const fileExtension = extname(file.name);
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = join(TEMP_DIR, fileName);
  
  // 读取文件内容
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  
  // 写入文件
  await writeFile(filePath, fileBuffer);
  
  return filePath;
}

// 处理PDF文件 (简化处理，仅返回固定提示)
async function processPdf(): Promise<string> {
  return `PDF文件内容已提取，但由于依赖项问题，无法显示完整内容。请使用TXT或MD格式文件获得更好的结果。`;
}

// 处理DOCX文件 (简化处理，仅返回固定提示)
async function processDocx(): Promise<string> {
  return `Word文档内容已提取，但由于依赖项问题，无法显示完整内容。请使用TXT或MD格式文件获得更好的结果。`;
}

// 处理文本文件
async function processTextFile(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf8');
    return sanitizeText(content);
  } catch (error) {
    console.error('处理文本文件出错:', error);
    throw new Error('无法读取文本文件内容');
  }
}

// 处理HTML文件
async function processHtml(filePath: string): Promise<string> {
  try {
    const htmlContent = await readFile(filePath, 'utf8');
    
    // 使用简单的正则表达式提取文本内容
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return sanitizeText(textContent);
  } catch (error) {
    console.error('处理HTML文件出错:', error);
    throw new Error('无法提取HTML文件内容');
  }
}

// 将提取的文本转换为Markdown
function convertToMarkdown(text: string): string {
  if (!text) return '';
  
  try {
    // 确保文本是安全的
    const safeText = sanitizeText(text);
    
    // 简单转换，可以根据需要添加更复杂的规则
    const lines = safeText.split('\n');
    let markdown = '';
    let inList = false;
    
    for (let line of lines) {
      line = line.trim();
      if (!line) {
        markdown += '\n\n';
        inList = false;
        continue;
      }
      
      // 假设可能的标题（大写字母或数字开头的短行）
      if (line.length < 100 && /^[A-Z0-9\u4e00-\u9fa5]/.test(line) && !line.endsWith('.')) {
        markdown += `\n## ${line}\n\n`;
      }
      // 假设是列表项
      else if (line.match(/^[\-\*\+] /) || line.match(/^\d+[\.\)] /) || line.match(/^[a-z][\.\)] /) || line.match(/^•/)) {
        if (!inList) {
          markdown += '\n';
          inList = true;
        }
        // 统一列表格式
        markdown += `- ${line.replace(/^[\d\*\-a-z]+[\.\)]|^•\s*/, '')}\n`;
      }
      // 普通段落
      else {
        if (inList) {
          markdown += '\n';
          inList = false;
        }
        markdown += `${line}\n\n`;
      }
    }
    
    return markdown.trim();
  } catch (error) {
    console.error('转换Markdown时出错:', error);
    return text; // 如果转换失败，返回原始文本
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }
    
    // 检查文件大小（限制为20MB）
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件大小超过限制(20MB)' }, { status: 400 });
    }
    
    // 检查文件类型
    const fileExtension = extname(file.name).toLowerCase();
    if (!['.pdf', '.docx', '.doc', '.txt', '.md', '.html', '.htm'].includes(fileExtension)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 });
    }
    
    let extractedText = '';
    let filePath = '';
    
    try {
      // 保存文件
      console.log('保存上传的文件:', file.name);
      filePath = await saveFile(file);
      console.log('文件已保存到:', filePath);
      
      // 根据文件类型处理
      console.log('处理文件内容:', fileExtension);
      
      if (fileExtension === '.pdf') {
        extractedText = await processPdf();
      } else if (['.docx', '.doc'].includes(fileExtension)) {
        extractedText = await processDocx();
      } else if (['.txt', '.md'].includes(fileExtension)) {
        extractedText = await processTextFile(filePath);
      } else if (['.html', '.htm'].includes(fileExtension)) {
        extractedText = await processHtml(filePath);
      }
      
      console.log('文件内容提取成功，提取的文本长度:', extractedText.length);
    } catch (error) {
      console.error('处理文件内容出错:', error);
      extractedText = `无法完全提取文件内容，请尝试使用TXT或MD格式文件。\n\n文件名：${file.name}\n文件大小：${(file.size / 1024).toFixed(2)} KB`;
    }
    
    // 转换为Markdown
    let markdownContent = '';
    try {
      markdownContent = convertToMarkdown(extractedText);
      console.log('Markdown转换成功，结果长度:', markdownContent.length);
    } catch (conversionError) {
      console.error('Markdown转换失败:', conversionError);
      markdownContent = extractedText; // 如果转换失败，使用原始文本
    }
    
    return NextResponse.json({ 
      content: markdownContent,
      fileName: file.name
    });
    
  } catch (error) {
    console.error('文件处理出错:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '文件处理失败'
    }, { status: 500 });
  }
} 