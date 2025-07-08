import { app, shell, BrowserWindow, ipcMain, dialog  } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs/promises'
import path from 'path'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('open-select-folder', async (event) => {
    // 调用系统对话框选择文件夹（仅允许选择目录）
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'], // 关键配置：只允许选择文件夹
      title: '请选择工作目录', // 对话框标题
      buttonLabel: '确认选择' // 确认按钮文本
    })

    // 如果用户未取消选择且选择了文件夹
    if (!result.canceled && result.filePaths.length > 0) {
      // 向渲染进程发送选择的文件夹路径（通过 event.sender 定位到当前窗口的渲染进程）
      event.sender.send('folder-selected', result.filePaths[0])
    }
  })

  ipcMain.on('get-folder-content', async (event, folderPath) => {
    try {
      // 读取文件夹下的所有条目（文件和子文件夹）
      const entries = await fs.readdir(folderPath, { withFileTypes: true })

      // 分类整理：子文件夹、图片文件（根据扩展名筛选）
      const folders = []
      const images = []
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'] // 支持的图片格式

      for (const entry of entries) {
        const fullPath = path.join(folderPath, entry.name)
        if (entry.isDirectory()) {
          folders.push({ name: entry.name, path: fullPath })
        } else if (entry.isFile() && imageExtensions.includes(path.extname(entry.name).toLowerCase())) {
          images.push({ name: entry.name, path: fullPath })
        }
      }

      // 向渲染进程返回结果
      event.sender.send('received-folder-content', { folders, images })
    } catch (error) {
      console.error('读取文件夹失败:', error)
      event.sender.send('received-folder-content', { error: '读取文件夹失败' })
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
