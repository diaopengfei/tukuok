import { ipcMain, dialog, IpcMainEvent } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

interface FolderItem {
  name: string
  path: string
}

interface ImageItem {
  name: string
  path: string
  thumbnailPath: string
}

// 注册所有IPC事件监听
export function registerIpcHandlers(): void {
  // 选择文件夹事件
  ipcMain.on('open-select-folder', async (event: IpcMainEvent) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: '请选择工作目录',
        buttonLabel: '确认选择'
      })

      if (!result.canceled && result.filePaths.length > 0) {
        event.sender.send('folder-selected', result.filePaths[0])
      }
    } catch (error) {
      console.error('选择文件夹失败:', error)
      event.sender.send('folder-selected-error', '选择文件夹失败')
    }
  })

  // 获取文件夹内容事件
  ipcMain.on('get-folder-content', async (event: IpcMainEvent, folderPath: string) => {
    try {
      const entries = await fs.readdir(folderPath, { withFileTypes: true })
      const folders: FolderItem[] = []
      const images: ImageItem[] = []
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']

      // 创建.tukuok目录
      const tukuokDir = path.join(folderPath, '.tukuok')
      await fs.mkdir(tukuokDir, { recursive: true })

      // 处理文件夹
      entries.forEach(entry => {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const fullPath = path.join(folderPath, entry.name)
          folders.push({ name: entry.name, path: fullPath })
        }
      })

      // 处理图片文件
      const imageEntries = entries.filter(entry =>
        entry.isFile() &&
        imageExtensions.includes(path.extname(entry.name).toLowerCase())
      )

      const totalImages = imageEntries.length
      let processedCount = 0

      for (const entry of imageEntries) {
        const fullPath = path.join(folderPath, entry.name)
        const thumbnailPath = path.join(tukuokDir, `${entry.name}_thumb.jpg`)

        try {
          await fs.access(thumbnailPath)
        } catch {
          try {
            await sharp(fullPath)
              .resize(200, 200, {
                fit: 'inside',
                withoutEnlargement: true,
                position: 'center'
              })
              .jpeg({ quality: 80, progressive: true })
              .toFile(thumbnailPath)
          } catch (sharpError) {
            console.error(`生成缩略图失败 (${entry.name}):`, sharpError)
            // 创建占位缩略图
            try {
              await fs.copyFile(fullPath, thumbnailPath)
            } catch (copyError) {
              console.error(`复制占位图失败 (${entry.name}):`, copyError)
              continue
            }
          }
        }

        processedCount++
        const progress = Math.round((processedCount / Math.max(totalImages, 1)) * 100)
        event.sender.send('thumbnail-progress', progress)

        images.push({
          name: entry.name,
          path: fullPath,
          thumbnailPath
        })
      }

      event.sender.send('received-folder-content', { folders, images })
    } catch (error) {
      console.error('读取文件夹失败:', error)
      event.sender.send('received-folder-content', {
        error: error instanceof Error ? error.message : '读取文件夹失败'
      })
    }
  })
}
