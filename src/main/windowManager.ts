import { BrowserWindow, shell} from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 窗口配置常量（可根据需要调整）
const WINDOW_CONFIG = {
  width: 1920,
  height: 1080,
  show: false,
  autoHideMenuBar: true,
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false,

    webSecurity: false,  // 开发环境临时关闭web安全策略
    allowRunningInsecureContent: true,
    allowFileAccess: true
  }
}

// 创建主窗口并返回实例
export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    ...WINDOW_CONFIG,
    ...(process.platform === 'linux' ? { icon } : {})
  })

  // 窗口显示逻辑
  mainWindow.on('ready-to-show', () => mainWindow.show())

  // 外部链接处理
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 加载页面逻辑（开发/生产环境区分）
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
