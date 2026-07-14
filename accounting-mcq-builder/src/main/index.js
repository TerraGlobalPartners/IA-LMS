import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import {
  listTests,
  getTest,
  saveTest,
  deleteTest,
  duplicateTest,
  importTestFromFile
} from './store'

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Accounting MCQ Test Builder',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers() {
  ipcMain.handle('tests:list', async () => {
    return listTests()
  })

  ipcMain.handle('tests:get', async (_event, id) => {
    return getTest(id)
  })

  ipcMain.handle('tests:save', async (_event, test) => {
    return saveTest(test)
  })

  ipcMain.handle('tests:delete', async (_event, id) => {
    await deleteTest(id)
    return true
  })

  ipcMain.handle('tests:duplicate', async (_event, id) => {
    return duplicateTest(id)
  })

  ipcMain.handle('tests:export', async (_event, id) => {
    const test = await getTest(id)
    const safeName = (test.title || 'untitled-test').replace(/[\\/:*?"<>|]+/g, ' ').trim()
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Test',
      defaultPath: `${safeName || 'untitled-test'}.json`,
      filters: [{ name: 'Test Template', extensions: ['json'] }]
    })
    if (canceled || !filePath) {
      return { canceled: true }
    }
    const fs = await import('fs/promises')
    await fs.writeFile(filePath, JSON.stringify(test, null, 2), 'utf-8')
    return { canceled: false, filePath }
  })

  ipcMain.handle('tests:import', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Test',
      properties: ['openFile'],
      filters: [{ name: 'Test Template', extensions: ['json'] }]
    })
    if (canceled || filePaths.length === 0) {
      return { canceled: true }
    }
    try {
      const test = await importTestFromFile(filePaths[0])
      return { canceled: false, test }
    } catch (err) {
      return { canceled: false, error: err.message }
    }
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
