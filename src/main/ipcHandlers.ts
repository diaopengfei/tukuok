import { homeIpcHandlers } from './ipc/home'

// 注册所有IPC事件监听
export function registerIpcHandlers(): void {
  homeIpcHandlers()
}
