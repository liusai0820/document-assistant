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
  }
  
  function htmlToDocx(html: string, options?: HTMLToDocxOptions): Promise<Buffer>;
  export = htmlToDocx;
} 