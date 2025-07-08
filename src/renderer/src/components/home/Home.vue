<template>
  <el-container>

    <el-header class="home-header">
      当前工作目录：{{ folderPath }}
      <p></p>
    </el-header>
    <el-main>
      <!-- 错误提示 -->
      <div v-if="error" class="error">{{ error }}</div>

      <!-- 子文件夹列表 -->
      <div v-if="folders.length" class="section">
        <h2>子文件夹</h2>
        <div class="list">
          <div v-for="folder in folders" :key="folder.path" class="item">📁 {{ folder.name }}</div>
        </div>
      </div>

      <!-- 图片列表 -->
      <div v-if="images.length" class="section">
        <h2>图片文件</h2>
        <div class="list image-list">
          <div v-for="image in images" :key="image.path" class="image-item">
            <img :src="`file://${image.path}`" :alt="image.name" />
            <p>{{ image.name }}</p>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 获取当前路由对象
const route = useRoute()
// 从 query 参数中读取 folderPath（类型断言为 string，根据实际场景处理可能的 undefined）
const folderPath = route.query.folderPath as string

// 存储文件夹内容和状态
const folders = ref([])
const images = ref([])
const error = ref('')

onMounted(() => {
  if (!folderPath) {
    error.value = '未获取到有效工作目录'
    return
  }

  // 通过 IPC 向主进程请求文件夹内容
  window.electron.ipcRenderer.send('get-folder-content', folderPath)
  window.electron.ipcRenderer.once('received-folder-content', (_, data) => {
    if (data.error) {
      error.value = data.error
    } else {
      folders.value = data.folders
      images.value = data.images
    }
  })
})

</script>


<style scoped>
.home-header {
  background-color: #409eff;
  color: #fff;
  line-height: 60px;
}
.section {
  margin: 20px 0;
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
