// 为没有类型声明的库添加声明

declare module 'pdfmake-chinese' {
  export const chineseFonts: {
    vfs: Record<string, string>;
  };
} 

// 添加CKEditor相关模块的类型声明
declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditorBuild: any;
  export = ClassicEditorBuild;
}

declare module '@ckeditor/ckeditor5-build-decoupled-document' {
  const DecoupledEditorBuild: any;
  export = DecoupledEditorBuild;
} 