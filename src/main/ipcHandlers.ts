import { ipcMain, dialog, IpcMainEvent } from 'electron'
import fs from 'fs/promises'
import path from 'path'

// 注册所有IPC事件监听
export function registerIpcHandlers(): void {
  // 选择文件夹事件
  ipcMain.on('open-select-folder', async (event: IpcMainEvent) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '请选择工作目录',
      buttonLabel: '确认选择'
    })

    if (!result.canceled && result.filePaths.length > 0) {
      event.sender.send('folder-selected', result.filePaths[0])
    }
  })

  // 获取文件夹内容事件
  ipcMain.on('get-folder-content', async (event: IpcMainEvent, folderPath: string) => {
    try {
      const entries = await fs.readdir(folderPath, { withFileTypes: true })
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

      event.sender.send('received-folder-content', { folders, images })
    } catch (error) {
      console.error('读取文件夹失败:', error)
      event.sender.send('received-folder-content', { error: '读取文件夹失败' })
    }
  })
}
