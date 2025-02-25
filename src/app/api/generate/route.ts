import { NextResponse } from 'next/server';

// 安全处理文本，处理特殊字符
function sanitizeText(text: string): string {
  if (!text) return '';
  // 用空格替换控制字符
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
}

// Base64 编码，用于处理包含中文的字符串在header中传递
function safeEncodeHeader(text: string): string {
  if (!text) return '';
  try {
    // 对于包含中文的文本，使用 Base64 编码
    if (/[\u4e00-\u9fa5]/.test(text)) {
      return 'base64:' + Buffer.from(text).toString('base64');
    }
    return text;
  } catch (e) {
    console.warn('编码头信息失败:', e);
    return 'Document Assistant'; // 出错时使用英文名称
  }
}

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 带有重试机制的fetch函数
 * @param url API地址
 * @param options fetch选项
 * @param retries 重试次数
 * @param backoff 退避时间（毫秒）
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = 3, 
  backoff = 1000
): Promise<Response> {
  try {
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    const fetchOptions = {
      ...options,
      signal: controller.signal,
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    console.warn(`API调用失败，将在${backoff}ms后重试，剩余重试次数: ${retries-1}`);
    console.error('错误详情:', error);
    
    // 延迟后重试
    await delay(backoff);
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}

/**
 * 处理来自API的流式响应
 */
async function* streamProcessor(stream: ReadableStream): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              yield content;
            }
          } catch (e) {
            console.warn('无法解析行:', line, e);
          }
        }
      }
    }
  } catch (error) {
    console.error('流处理出错:', error);
    yield `\n\n生成过程中出错: ${error instanceof Error ? error.message : '未知错误'}`;
  } finally {
    reader.releaseLock();
  }
}

// 后备模型配置
const FALLBACK_MODELS = [
  'anthropic/claude-3.7-sonnet',
  'google/gemini-2.0-pro-exp-02-05:free',
  'openai/gpt-3.5-turbo'
];

/**
 * 获取后备模型
 * @param currentModel 当前模型ID
 * @returns 后备模型ID
 */
function getFallbackModel(currentModel: string): string | null {
  const index = FALLBACK_MODELS.indexOf(currentModel);
  
  if (index === -1 || index === FALLBACK_MODELS.length - 1) {
    return null; // 没有可用的后备模型
  }
  
  return FALLBACK_MODELS[index + 1];
}

// 为模型提供不同文档类型的提示
function getPromptForDocumentType(type: string, subtype: string, title: string, reference?: string): string {
  // 通用指导内容
  const commonInstructions = `
请直接输出标准中国公文格式的内容，不要包含任何额外的标记、元数据或说明。
不要使用**粗体**、*斜体*等markdown语法，不要使用"markdown #"或其他格式说明。
不要包含"好的，我将为您生成..."等回应语句，直接输出公文内容。
不要添加任何非正文的说明、注释或解释，直接生成符合公文规范的正文。

需遵循以下格式规范：
1. 标题居中，字体为黑体，字号为小2号（22pt）
2. 正文使用仿宋字体，字号为3号（16pt），行间距为28pt
3. 一级标题使用"一、"、"二、"等序号，字体为黑体，字号为3号
4. 二级标题使用"（一）"、"（二）"等序号，字体为黑体，字号为3号
5. 段落首行缩进2个汉字符
6. 文字两端对齐
  `;

  // 根据文档类型提供特定指导
  if (type === 'official') {
    if (subtype === 'notice') {
      return `
${commonInstructions}

请生成一份标题为"${title}"的正式通知文件。
通知格式要求：
1. 开头写明主送单位，结尾为"X X X（发文机关）"和"20XX年XX月XX日"
2. 正文开始段简要说明通知背景和目的
3. 分点表述具体通知内容和要求
4. 结尾说明执行要求和时间节点

${reference ? `参考资料：${reference}` : ''}`;
    }
    
    if (subtype === 'announcement') {
      return `
${commonInstructions}

请生成一份标题为"${title}"的正式公告文件。
公告格式要求：
1. 不需要主送单位，直接公告内容
2. 正文分段阐述公告内容
3. 结尾标明发文机关和日期

${reference ? `参考资料：${reference}` : ''}`;
    }
    
    // 默认官方文件格式
    return `
${commonInstructions}

请生成一份标题为"${title}"的正式公文。
公文格式要求：
1. 开头说明背景和目的
2. 内容分点表述，条理清晰
3. 结尾说明执行要求
4. 标明落款和日期

${reference ? `参考资料：${reference}` : ''}`;
  }
  
  if (type === 'report') {
    if (subtype === 'summary_report') {
      return `
${commonInstructions}

请生成一份标题为"${title}"的情况报告。
报告格式要求：
1. 开头写明主送单位（如"市政府："）
2. 正文分为开头、主体、结尾三部分
3. 主体部分分点说明调研情况、分析结论
4. 结尾提出建议或意见
5. 需要标明发文单位（如"市发展改革委"）和日期

${reference ? `参考资料：${reference}` : ''}`;
    }
    
    if (subtype === 'work_report') {
      return `
${commonInstructions}

请生成一份标题为"${title}"的工作报告。
报告格式要求：
1. 开头简要总结工作概况
2. 按照时间或主题分段介绍工作情况，可用"一、"等序号分类
3. 分析存在的问题和不足
4. 提出下一步工作计划和思路
5. 需要标明报告单位和日期

${reference ? `参考资料：${reference}` : ''}`;
    }
    
    // 默认报告格式
    return `
${commonInstructions}

请生成一份标题为"${title}"的报告文件。
报告格式要求：
1. 开头说明报告背景和目的
2. 主体内容分段阐述，可用序号标识
3. 结尾总结或提出建议
4. 标明落款和日期

${reference ? `参考资料：${reference}` : ''}`;
  }
  
  // 其他文档类型同理...
  
  // 默认prompt
  return `
${commonInstructions}

请生成一份标题为"${title}"的正式文档。
文档格式要求：
1. 结构清晰，层次分明
2. 内容详实，客观准确
3. 语言规范，表述严谨
4. 如有必要，分点说明

${reference ? `参考资料：${reference}` : ''}`;
}

const maxRetries = 3; // 最大重试次数

export async function POST(request: Request) {
  try {
    console.log('收到生成文档请求');
    
    // 解析请求体
    const { 
      type, 
      subtype, 
      title, 
      model = 'anthropic/claude-3.7-sonnet', 
      customPrompt, 
      referenceContent, 
      stream = false 
    } = await request.json();
    
    console.log(`请求参数: 类型=${type}, 子类型=${subtype}, 标题=${title}, 模型=${model}, 流式=${stream}`);
    
    // 验证必填参数
    if (!type || !title) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 获取模型prompt
    let prompt = customPrompt || getPromptForDocumentType(type, subtype, title, referenceContent);
    
    // 安全处理应用名称（防止潜在的注入）
    const appNameBase64 = Buffer.from('公文写作助手').toString('base64');
    
    // 如果有参考内容，附加到prompt中
    if (referenceContent) {
      // 安全处理参考内容
      const safeReferenceContent = sanitizeText(referenceContent);
      prompt = `${prompt}\n\n${safeReferenceContent}`;
    }
    
    // 安全处理prompt，避免特殊字符问题
    prompt = sanitizeText(prompt);
    
    console.log(`准备调用API生成内容, 模型: ${model}, prompt长度: ${prompt.length}, 流式: ${stream}`);
    
    // 检查prompt长度，对超长prompt进行截断
    const MAX_PROMPT_LENGTH = 24000; // 设置一个最大长度阈值
    if (prompt.length > MAX_PROMPT_LENGTH) {
      console.warn(`提示词过长(${prompt.length}字符)，将截断到${MAX_PROMPT_LENGTH}字符`);
      // 保留前后部分，截断中间部分
      const frontPart = prompt.substring(0, MAX_PROMPT_LENGTH / 2);
      const backPart = prompt.substring(prompt.length - MAX_PROMPT_LENGTH / 2);
      prompt = `${frontPart}\n\n...(内容过长，中间部分已省略)...\n\n${backPart}`;
    }
    
    // 确保API密钥存在
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('未找到API密钥');
      return NextResponse.json({ error: 'API密钥配置错误，请联系管理员' }, { status: 500 });
    }
    
    // 尝试的模型及其他配置
    let selectedModel = model;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        // 构建API请求对象
        const requestBody = {
          model: selectedModel,
          messages: [
            { role: 'system', content: `你是一个专业的中国公文助手，帮助用户起草正式公文、报告、计划、总结等文档。
使用规范的公文格式和术语，语言严谨客观，符合公文写作规范，注重实用性和逻辑性。
当前应用: base64:${appNameBase64}` },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          stream: stream,
          max_tokens: 4000
        };
        
        console.log(`尝试使用模型: ${selectedModel} (尝试 ${retryCount + 1}/${maxRetries + 1})`);
        
        // 增加请求体手动序列化，避免中文编码问题
        const requestBodyString = JSON.stringify(requestBody);
        
        // 安全处理应用名称，避免中文字符导致编码问题
        const appTitle = process.env.NEXT_PUBLIC_APP_NAME 
          ? safeEncodeHeader(process.env.NEXT_PUBLIC_APP_NAME)
          : 'Document Assistant';
          
        // 使用安全的应用标题
        console.log(`使用安全处理后的应用标题: ${appTitle}`);
        
        // 创建没有中文字符的请求头
        const headers = {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': appTitle,
        };
        
        // 使用带重试的fetch函数
        const response = await fetchWithRetry(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: headers,
            body: requestBodyString
          },
          2, // 每个模型尝试2次
          1000 // 初始退避时间1秒
        );
        
        console.log(`API响应状态: ${response.status}`);
        
        if (!response.ok) {
          let errorMsg = `API调用失败: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            console.error('API错误详情:', errorData);
            if (errorData.error && errorData.error.message) {
              errorMsg = `API错误: ${errorData.error.message}`;
            }
          } catch (e) {
            console.error('无法解析API错误响应:', e);
          }
          
          // 如果是模型不可用的错误，尝试切换到后备模型
          if (response.status === 503 || response.status === 429) {
            const nextModel = getFallbackModel(selectedModel);
            if (nextModel && retryCount < maxRetries) {
              console.log(`模型 ${selectedModel} 不可用，切换到 ${nextModel}`);
              selectedModel = nextModel;
              retryCount++;
              continue;
            }
          }
          
          return NextResponse.json({ error: errorMsg }, { status: response.status < 500 ? response.status : 500 });
        }
        
        // 处理流式响应
        if (stream && response.body) {
          console.log('处理流式响应');
          // 创建流式响应
          const responseStream = new ReadableStream({
            async start(controller) {
              try {
                const processor = streamProcessor(response.body!);
                
                for await (const chunk of processor) {
                  // 处理中文字符等
                  const safeChunk = sanitizeText(chunk);
                  // SSE格式发送
                  const encodedChunk = new TextEncoder().encode(`data: ${JSON.stringify({ content: safeChunk })}\n\n`);
                  controller.enqueue(encodedChunk);
                }
                
                // 发送结束标记
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
              } catch (error) {
                console.error('流处理过程中出错:', error);
                // 发送错误信息
                const errorMessage = `生成过程中断: ${error instanceof Error ? error.message : '未知错误'}`;
                const encodedError = new TextEncoder().encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
                controller.enqueue(encodedError);
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
              }
            }
          });
          
          // 返回流式响应
          return new Response(responseStream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            }
          });
        }
        
        // 处理普通响应
        const data = await response.json();
        console.log('API调用成功，已获取响应');
        
        // 验证响应格式
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('API响应格式错误:', data);
          return NextResponse.json({ error: 'API响应格式错误' }, { status: 500 });
        }
        
        // 从响应中提取生成的内容
        const generatedContent = data.choices[0].message.content;
        
        // 安全处理返回的内容
        const safeContent = sanitizeText(generatedContent);
        
        console.log(`成功生成内容，长度: ${safeContent.length}`);
        return NextResponse.json({ content: safeContent });
        
      } catch (apiError) {
        console.error('API调用过程中出错:', apiError);
        
        // 如果有可用的后备模型且尚未达到最大重试次数，则尝试使用后备模型
        const nextModel = getFallbackModel(selectedModel);
        if (nextModel && retryCount < maxRetries) {
          console.log(`模型 ${selectedModel} 调用失败，切换到 ${nextModel}`);
          selectedModel = nextModel;
          retryCount++;
        } else {
          // 所有模型都失败，返回错误
          return NextResponse.json({ 
            error: `调用AI服务时出错: ${apiError instanceof Error ? apiError.message : '未知错误'}`,
            suggestion: '服务暂时不可用，请稍后重试。如果问题持续存在，请尝试使用其他AI模型。'
          }, { status: 500 });
        }
      }
    }
    
    // 所有尝试都失败
    return NextResponse.json({ 
      error: '所有可用模型均调用失败',
      suggestion: '服务暂时不可用，请稍后重试'
    }, { status: 500 });
    
  } catch (error) {
    console.error('生成内容时出错:', error);
    return NextResponse.json({ 
      error: `生成内容时发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
      suggestion: '请检查您的输入并稍后重试' 
    }, { status: 500 });
  }
} 