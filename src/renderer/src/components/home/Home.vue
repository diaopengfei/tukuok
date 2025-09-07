<template>
  <el-container>
    <el-header class="home-header">
      当前工作目录：{{ folderPath }}
      <p></p>
    </el-header>
    <el-main>
      <!-- 进度条 -->
      <div v-if="showProgress" class="progress-section">
        <el-progress :percentage="progress" :show-text="true" />
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error">{{ error }}</div>

      <!-- 子文件夹列表 -->
      <div v-if="folders.length" class="section">
        <h2>子文件夹</h2>
        <div class="folder-grid">
          <div v-for="folder in folders" :key="folder.path" class="folder-card">
            <div class="folder-icon">📁</div>
            <div class="folder-name">{{ folder.name }}</div>
          </div>
        </div>
      </div>

      <!-- 图片列表 - 改为卡片形式 -->
      <div v-if="images.length" class="section">
        <h2>图片文件</h2>
        <div class="folder-grid">
          <div v-for="image in images" :key="image.path" class="image-card">
            <div class="image-preview">
              <img :src="getImageUrl(image.thumbnailPath || image.path)" :alt="image.name" @error="handleImageError" loading="lazy" />
            </div>
            <div class="image-name">{{ image.name }}</div>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { FolderItem, ImageItem } from '@renderer/types'
// 删除 Node.js path 模块导入，渲染进程不直接支持

const route = useRoute()
const folderPath = route.query.folderPath as string

// 使用正确的类型定义
const folders = ref<FolderItem[]>([])
const images = ref<ImageItem[]>([])
const error = ref<string>('')
const progress = ref<number>(0)
const showProgress = ref<boolean>(false)
const ERROR_IMAGE_BASE64: string =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='

// 清理函数
let removeThumbnailProgressListener: (() => void) | null = null

// 重构getImageUrl方法
const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) {
    return ERROR_IMAGE_BASE64
  }

  try {
    // 解码URL编码的路径
    const decodedPath = decodeURIComponent(imagePath)
    // 标准化路径，处理重复斜杠问题
    const normalizedPath = decodedPath
      .replace(/\\/g, '/')        // 将反斜杠替换为正斜杠
      .replace(/([a-zA-Z]:)\/+/, '$1/')  // 修复盘符后的重复斜杠 (如 E:/// → E:/)

    // 确保正确的file协议格式
    return normalizedPath.startsWith('file://')
      ? normalizedPath
      : `file:///${normalizedPath}` // 移除多余的前导斜杠
  } catch (error) {
    console.error('路径处理错误:', error)
    return ERROR_IMAGE_BASE64
  }
}

const handleImageError = (e: Event): void => {
  const target = e.target as HTMLImageElement
  const originalSrc = target.src
  console.error('图片加载失败:', originalSrc)

  // 尝试使用备用路径：如果原路径是缩略图，尝试加载原图
  if (originalSrc.includes('_thumb')) {
    const originalImageSrc = originalSrc.replace('_thumb.jpg', '')
    console.log('尝试加载原图:', originalImageSrc)
    target.src = originalImageSrc
    return
  }

  // 最终使用错误占位图
  target.src = ERROR_IMAGE_BASE64

  // 添加错误提示到UI
  error.value = `图片加载失败: ${originalSrc.split('/').pop()}`
}

onMounted(() => {
  if (!folderPath) {
    error.value = '未获取到有效工作目录'
    return
  }

  // 添加进度监听器
  const thumbnailProgressListener = (_: unknown, progressValue: number): void => {
    showProgress.value = true
    progress.value = progressValue
  }

  window.electron.ipcRenderer.on('thumbnail-progress', thumbnailProgressListener)
  removeThumbnailProgressListener = (): void => {
    window.electron.ipcRenderer.removeListener('thumbnail-progress', thumbnailProgressListener)
  }

  window.electron.ipcRenderer.send('get-folder-content', folderPath)
  window.electron.ipcRenderer.once('received-folder-content', (_, data) => {
    if (data.error) {
      error.value = data.error
    } else {
      folders.value = data.folders || []
      images.value = data.images || []

      // 添加调试日志
      console.log('接收到的图片数据:', images.value)
      if (images.value.length > 0) {
        console.log('第一张图片缩略图路径:', images.value[0].thumbnailPath)
        console.log('第一张图片URL:', getImageUrl(images.value[0].thumbnailPath))
      }
    }
    showProgress.value = false
    progress.value = 0
  })
})

onUnmounted(() => {
  if (removeThumbnailProgressListener) {
    removeThumbnailProgressListener()
  }
})
</script>

<style scoped>
.home-header {
  background-color: white;
  color: black;
  line-height: 60px;
  border: gray 1px solid;
  box-shadow: gray 0.5px 0.5px;
}
.progress-section {
  margin: 20px 0;
}
.section {
  margin: 20px 0;
}
.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 10px;
}
.folder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  border-radius: 8px;
  background-color: #f5f7fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}
.folder-card:hover {
  background-color: #e9eef5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.folder-icon {
  font-size: 24px;
  margin-bottom: 8px;
}
.folder-name {
  font-size: 14px;
  text-align: center;
  word-break: break-all;
}

/* 图片卡片样式 */
.image-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  border-radius: 8px;
  background-color: #f5f7fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  aspect-ratio: 1;
}
.image-card:hover {
  background-color: #e9eef5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.image-preview {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #e4e7ed;
}
.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
.image-name {
  font-size: 12px;
  text-align: center;
  word-break: break-all;
  color: #606266;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error {
  color: #ff4d4f;
  padding: 10px;
}
</style>
