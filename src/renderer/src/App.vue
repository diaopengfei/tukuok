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
import { ref } from 'vue'
import { Eleme } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const showSelectFolderBtn = ref(true)
const router = useRouter()

const openFolderSelect = (): void => {
  // 选择文件夹
  window.electron.ipcRenderer.send('open-select-folder')
  window.electron.ipcRenderer.once('folder-selected', (_, folderPath) => {
    showSelectFolderBtn.value = false
    router.push({
      name: 'home',
      query: { folderPath: folderPath }
    })
  })
}
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
