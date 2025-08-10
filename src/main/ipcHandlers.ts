import { ipcMain, dialog, IpcMainEvent } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

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
      const folders: { name: string; path: string }[] = []
      const images: { name: string; path: string }[] = []
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'] // 支持的图片格式
      // 创建.tukuok目录
      const tukuokDir = path.join(folderPath, '.tukuok')
      try {
        await fs.access(tukuokDir)
      } catch {
        await fs.mkdir(tukuokDir, { recursive: true })
      }
      for (const entry of entries) {
        const fullPath = path.join(folderPath, entry.name)
        if (entry.isDirectory()) {
          folders.push({ name: entry.name, path: fullPath })
        } else if (
          entry.isFile() &&
          imageExtensions.includes(path.extname(entry.name).toLowerCase())
        ) {
          // 生成缩略图
          const thumbnailPath = path.join(tukuokDir, `${entry.name}_thumb.jpg`)
          try {
            // 检查缩略图是否已存在
            await fs.access(thumbnailPath)
          } catch {
            // 如果缩略图不存在，则生成
            await sharp(fullPath)
              .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 80 })
              .toFile(thumbnailPath)
          }

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
