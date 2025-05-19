<template>
  <div>
    <div class="app-container">
      <el-button type="primary" :loading-icon="Eleme"
                 size="large" @click="openFolderSelect">点击选择工作目录</el-button>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { Eleme } from '@element-plus/icons-vue'
const openFolderSelect = (): void =>  {
  window.electron.ipcRenderer.send('open-select-folder')
  window.electron.ipcRenderer.once('folder-selected', (_, folderPath) => {
    console.log('用户选择的文件夹路径：', folderPath)
  })
}
</script>

<style scoped>
.app-container {
  height: 100vh; /* 占满视口高度 */
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
}
</style>
