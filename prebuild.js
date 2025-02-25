// prebuild.js - CommonJS格式
// 本文件被设计为通过node直接执行，不受ESLint规则限制
/* eslint-disable */
const fs = require('fs');
const path = require('path');

// 确保文件夹路径存在
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 主函数
const main = () => {
  console.log('运行预构建脚本...');

  // 确保所有必要的目录存在
  ensureDir(path.join(__dirname, 'src/components/FileUploader'));
  ensureDir(path.join(__dirname, 'src/components/WordPreview'));
  ensureDir(path.join(__dirname, 'src/data'));

  // 让构建过程知道这是一个新的构建
  const buildInfo = {
    buildTime: new Date().toISOString(),
    buildNumber: Date.now()
  };

  fs.writeFileSync(
    path.join(__dirname, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );

  console.log('预构建完成!');
};

// 执行主函数
main(); 