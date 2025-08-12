<template>
  <div>
    <el-container class="app-container">
      <el-button type="primary"
                 :loading-icon="Eleme"
                 size="large"
                 style="margin: auto;"
                 v-if="showSelectFolderBtn"
                 @click="openFolderSelect">点击选择工作目录</el-button>
      <router-view />
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Eleme } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const showSelectFolderBtn = ref(true)
const router = useRouter()

const openFolderSelect = (): void => {
  window.electron.ipcRenderer.send('open-select-folder')

  const folderSelectedHandler = (_: unknown, folderPath: string): void => {
    showSelectFolderBtn.value = false
    router.push({
      name: 'home',
      query: { folderPath }
    })
    // 清理监听器
    window.electron.ipcRenderer.removeListener('folder-selected', folderSelectedHandler)
  }

  window.electron.ipcRenderer.once('folder-selected', folderSelectedHandler)
}

// 检查是否已经选择了文件夹
onMounted(() => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.query.folderPath) {
    showSelectFolderBtn.value = false
  }
})
</script>


<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
