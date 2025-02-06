const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // 可选的预加载脚本
            nodeIntegration: true,
            contextIsolation: false // 允许在渲染进程中使用 Node.js API
        }
    });

    // 加载 index.html 文件
    mainWindow.loadFile('index.html');

    // 打开开发者工具（开发阶段）
    mainWindow.webContents.openDevTools();
}

// 当 Electron 应用准备好时创建窗口
app.whenReady().then(() => {
    createWindow();

    // 当所有窗口关闭时退出应用（macOS 除外）
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    // 当应用被激活时重新创建窗口（macOS 中点击 Dock 图标）
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});