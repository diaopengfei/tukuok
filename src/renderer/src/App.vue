<template>
  <div class="whole-app-container">
    <div v-if="showSelectFolderBtn" class="select-folder-container">
      <el-button type="primary" :loading-icon="Eleme" size="large" @click="openFolderSelect"
        >点击选择工作目录</el-button
      >
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Eleme } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const showSelectFolderBtn = ref(true)
const router = useRouter()

const openFolderSelect = (): void =>  {
  window.electron.ipcRenderer.send('open-select-folder')
  window.electron.ipcRenderer.once('folder-selected', (_, folderPath) => {
    console.log('用户选择的文件夹路径：', folderPath);
    showSelectFolderBtn.value = false
    router.push({
      name: 'Home',
      query: { folderPath: folderPath }
    });

  })
}
</script>

<style scoped>
.select-folder-container {
  height: 100vh; /* 占满视口高度 */
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
}
</style>
