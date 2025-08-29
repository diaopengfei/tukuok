### Tukuok - 本地图库管理工具

Tukuok是一个基于Electron + Vue 3 + TypeScript开发的现代化本地图库管理应用，专为摄影师、设计师和图像工作者打造，提供高效、直观的图片管理体验。

#### 🌟 功能特性
✅ 已实现功能
智能目录管理 - 自动扫描和显示文件夹结构
快速预览 - 为图片自动生成缩略图，支持JPG、PNG、GIF、WebP等主流格式
实时进度 - 显示缩略图生成进度
跨平台支持 - 支持Windows、macOS、Linux
现代化UI - 基于Element Plus的响应式设计
#### 🚧 开发中功能
- [ ] 本地图片标签系统
- [ ] 图库地图可视化
- [ ] 云端同步备份
- [ ] 高级搜索和筛选
- [ ] 批量重命名和格式转换
- [ ] 图片元数据管理
#### 🛠 技术栈
| 技术 | 用途 |
|------|------|
| Electron | 跨平台桌面应用框架 |
| Vue 3 | 前端框架 |
| TypeScript | 类型安全 |
| Element Plus | UI组件库 |
| Sharp | 高性能图片处理 |
| Vite | 构建工具 |

#### 🚀 快速开始
##### 环境要求
Node.js >= 18.0.0
npm >= 8.0.0
##### 安装依赖
```bash
npm install
```
##### 开发模式
```bash
npm run dev
```
##### 构建应用
Windows
```bash
npm run build:win
```
macOS
```bash
npm run build:mac
```
Linux
```bash
npm run build:linux
```


#### 📁 项目结构
```
tukuok/
├── src/
│   ├── main/           # 主进程代码
│   │   ├── index.ts    # 应用入口
│   │   ├── ipcHandlers.ts # IPC事件处理
│   │   └── windowManager.ts # 窗口管理
│   ├── preload/        # 预加载脚本
│   └── renderer/       # 渲染进程
│       ├── src/
│       │   ├── components/ # Vue组件
│       │   ├── App.vue     # 根组件
│       │   └── main.ts     # 渲染进程入口
├── build/              # 构建配置
├── dist/               # 构建输出
└── electron.vite.config.ts # Vite配置
```

#### 🎯 使用指南
启动应用 - 运行 npm run dev 或双击构建后的可执行文件
选择工作目录 - 点击"点击选择工作目录"按钮选择图片文件夹
浏览图库 - 应用会自动扫描并显示文件夹结构和图片缩略图
查看图片 - 点击缩略图可查看原图

#### 🔄 开发流程
代码规范
- 使用ESLint + Prettier进行代码格式化
- TypeScript严格模式
- 遵循Vue 3 Composition API规范

#### 可用脚本
```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 类型检查
npm run typecheck

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

#### 🤝 贡献指南
我们欢迎所有形式的贡献！无论你是想：

- 🐛 报告Bug
- 💡 提出新功能
- 📝 改进文档
- 🔧 提交代码
请通过以下方式参与：
1. Fork本项目
2. 创建功能分支 (git checkout -b feature/AmazingFeature)
3. 提交更改 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 创建Pull Request

#### 📝 许可证
本项目采用MIT许可证 - 查看 LICENSE 文件了解详情。

#### 👥 联系方式
项目地址: Gitee
问题反馈: Issues
邮箱: your-email@example.com

#### 🙏 致谢
感谢以下开源项目：
- Electron - 跨平台桌面应用框架
- Vue.js - 渐进式JavaScript框架
- Element Plus - 基于Vue 3的组件库
- Sharp - 高性能图片处理库
⭐ 如果这个项目对你有帮助，请给个Star支持一下！
