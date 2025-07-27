import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './windowManager'
import { registerIpcHandlers } from './ipcHandlers'

// 应用初始化
app.whenReady().then(() => {
  // 设置Windows应用模型ID
  electronApp.setAppUserModelId('com.electron')

  // 窗口快捷键优化（保留原逻辑）
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册IPC事件
  registerIpcHandlers()

  // 创建主窗口
  createMainWindow()

  // macOS激活应用时重建窗口（保留原逻辑）
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// 窗口全部关闭时退出应用（保留原逻辑）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
