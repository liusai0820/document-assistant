/**
 * 类型声明文件
 * 用于为缺少类型定义的第三方库添加类型声明
 */

/**
 * PDFMake类型声明
 */
declare module 'pdfmake/build/pdfmake' {
  interface PDFMake {
    createPdf: (documentDefinition: Record<string, unknown>) => PDFDocumentGenerator;
    vfs: Record<string, string>;
  }

  interface PDFDocumentGenerator {
    getBuffer: (callback: (buffer: Uint8Array) => void) => void;
    getBlob: (callback: (blob: Blob) => void) => void;
    download: (filename?: string) => void;
  }

  const pdfMake: PDFMake;
  export = pdfMake;
}

/**
 * PDFMake vfs_fonts 类型声明
 */
declare module 'pdfmake/build/vfs_fonts' {
  interface PDFFonts {
    pdfMake: {
      vfs: Record<string, string>;
    };
  }

  const pdfFonts: PDFFonts;
  export = pdfFonts;
}

/**
 * html-to-docx 类型声明
 */
declare module 'html-to-docx' {
  interface HTMLToDocxOptions {
    title?: string;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    header?: string;
    footer?: string;
    pageSize?: string;
    orientation?: 'portrait' | 'landscape';
    font?: string;
    fontSize?: number;
    styles?: string[];
    [key: string]: unknown;
  }
  
  function htmlToDocx(html: string, options?: HTMLToDocxOptions): Promise<Buffer>;
  export = htmlToDocx;
}

/**
 * mammoth类型声明
 */
declare module 'mammoth' {
  interface MammothOptions {
    path?: string;
    buffer?: Buffer;
    arrayBuffer?: ArrayBuffer;
  }
  
  interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
      level?: string;
    }>;
  }
  
  function extractRawText(options: MammothOptions): Promise<MammothResult>;
  
  export { extractRawText };
}

/**
 * pdf-text-extract类型声明
 */
declare module 'pdf-text-extract' {
  interface ExtractOptions {
    splitPages?: boolean;
  }
  
  function extract(
    filePath: string, 
    options: ExtractOptions, 
    callback: (err: Error | null, pages: string[]) => void
  ): void;
  
  namespace extract {
    // 添加命名空间，使之可以直接导入
  }
  
  export = extract;
} 