import React, { useEffect, useState } from 'react';
import { WordPreview } from './components/WordPreview';
import './App.css';

function App() {
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 模拟加载文档内容
  useEffect(() => {
    setIsLoading(true);
    
    // 模拟从文件或API获取内容
    setTimeout(() => {
      fetch('test-document.txt')
        .then(response => response.text())
        .then(content => {
          setDocumentContent(content);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('加载文档失败:', error);
          setIsLoading(false);
        });
    }, 1000);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>文档预览示例</h1>
      </header>
      <main className="App-content">
        <WordPreview 
          content={documentContent} 
          isLoading={isLoading} 
          title="深圳市发展改革委关于马来西亚半导体产业向前端转型并深度参与半导体产业链建设的情况报告"
        />
      </main>
    </div>
  );
}

export default App; 