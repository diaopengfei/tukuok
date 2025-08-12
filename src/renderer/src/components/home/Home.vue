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

      <!-- 图片列表 -->
      <div v-if="images.length" class="section">
        <h2>图片文件</h2>
        <div class="list image-list">
          <div v-for="image in images" :key="image.path" class="image-item">
            <img :src="getImageUrl(image.thumbnailPath || image.path)" :alt="image.name" @error="handleImageError" />
            <p>{{ image.name }}</p>
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

const route = useRoute()
const folderPath = route.query.folderPath as string

// 使用正确的类型定义
const folders = ref<FolderItem[]>([])
const images = ref<ImageItem[]>([])
const error = ref<string>('')
const progress = ref<number>(0)
const showProgress = ref<boolean>(false)

// 清理函数
let removeThumbnailProgressListener: (() => void) | null = null

const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
  }

  const normalizedPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '')
  return `file:///${normalizedPath}`
}

const handleImageError = (e: Event): void => {
  const target = e.target as HTMLImageElement
  console.error('图片加载失败:', target.src)
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkVycm9yPC90ZXh0Pjwvc3ZnPg=='
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
  removeThumbnailProgressListener = () => {
    window.electron.ipcRenderer.removeListener('thumbnail-progress', thumbnailProgressListener)
  }

  window.electron.ipcRenderer.send('get-folder-content', folderPath)
  window.electron.ipcRenderer.once('received-folder-content', (_, data) => {
    if (data.error) {
      error.value = data.error
    } else {
      folders.value = data.folders || []
      images.value = data.images || []
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
  background-color: #409eff;
  color: #fff;
  line-height: 60px;
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
.list {
  display: grid;
  gap: 10px;
  padding: 10px;
}
.image-list {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
.image-item {
  text-align: center;
}
.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}
.error {
  color: #ff4d4f;
  padding: 10px;
}
</style>
