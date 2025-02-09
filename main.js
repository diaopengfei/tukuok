const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let selectedDirectory = '';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    // 创建菜单栏
    const menuTemplate = [
        {
            label: '文件',
            submenu: [
                {
                    label: '修改图片文件夹路径',
                    click: async () => {
                        const result = await dialog.showOpenDialog({
                            properties: ['openDirectory']
                        });
                        if (!result.canceled) {
                            selectedDirectory = result.filePaths[0];
                            // 保存设置的路径
                            fs.writeFileSync('config.json', JSON.stringify({ directory: selectedDirectory }));
                            mainWindow.webContents.send('update-directory', selectedDirectory);
                        }
                    }
                },
                {
                    label: '退出',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // 监听渲染进程发送的选择目录请求
    ipcMain.handle('select-directory', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (!result.canceled) {
            return result.filePaths[0];
        } else {
            throw new Error('用户取消了选择');
        }
    });
}

// 读取保存的路径
try {
    const config = fs.readFileSync('config.json', 'utf8');
    selectedDirectory = JSON.parse(config).directory;
} catch (error) {
    // 如果文件不存在或读取失败，使用默认值
    selectedDirectory = '';
}

app.whenReady().then(() => {
    createWindow();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});