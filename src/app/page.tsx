import Link from 'next/link';

export default function Home() {
  // 公文类型数据
  const documentTypes = [
    { id: 'official', name: '公文', icon: '📄', description: '正式公文、通知、意见等' },
    { id: 'report', name: '报告', icon: '📊', description: '工作报告、调研报告、总结报告' },
    { id: 'plan', name: '计划', icon: '📝', description: '工作计划、项目规划、实施方案' },
    { id: 'summary', name: '总结', icon: '📑', description: '工作总结、项目总结、会议纪要' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">公文写作助手</span>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                首页
              </Link>
              <Link href="/documents" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                我的文档
              </Link>
              <Link href="/templates" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                模板中心
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-grow">
        {/* 英雄区域 */}
        <div className="bg-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
                  高效专业的<span className="text-blue-600">公文写作工具</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600">
                  利用AI技术，轻松生成专业公文、报告、计划等各类文档，支持个性化定制和一键导出，让公文写作变得简单高效。
                </p>
                <div className="mt-8 flex space-x-4">
                  <Link 
                    href="/create"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    开始创建文档
                  </Link>
                  <Link
                    href="/preview?template=redHeaderDocument"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-gray-50"
                  >
                    预览红头文件模板
                  </Link>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">创建新文档</h3>
                    <p className="mt-1 text-sm text-gray-600">选择一个文档类型开始创建</p>
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {documentTypes.map((type) => (
                        <Link
                          key={type.id}
                          href={`/create?type=${type.id}`}
                          className="relative group bg-white px-6 py-5 rounded-lg shadow border border-gray-200 hover:border-blue-500 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{type.icon}</span>
                            <div>
                              <h3 className="text-gray-900 font-medium">{type.name}</h3>
                              <p className="text-gray-500 text-sm">{type.description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能介绍 */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">强大的写作辅助功能</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                专业的公文写作解决方案，为您提供全方位的文档创作支持
              </p>
            </div>

            <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* 功能卡片 */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">智能生成</h3>
                <p className="text-gray-600">基于先进AI技术，根据您的需求智能生成高质量公文内容</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">个性化定制</h3>
                <p className="text-gray-600">支持自定义文档风格、内容要点和排版格式</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">多格式导出</h3>
                <p className="text-gray-600">一键导出为Word、PDF等多种格式，满足不同使用场景</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>© {new Date().getFullYear()} 公文写作助手 - 专业的公文写作辅助工具</p>
            <p className="mt-2 text-gray-400 text-sm">让公文写作变得简单高效</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
