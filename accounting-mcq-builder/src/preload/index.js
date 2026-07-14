import { contextBridge, ipcRenderer } from 'electron'

const api = {
  listTests: () => ipcRenderer.invoke('tests:list'),
  getTest: (id) => ipcRenderer.invoke('tests:get', id),
  saveTest: (test) => ipcRenderer.invoke('tests:save', test),
  deleteTest: (id) => ipcRenderer.invoke('tests:delete', id),
  duplicateTest: (id) => ipcRenderer.invoke('tests:duplicate', id),
  exportTest: (id) => ipcRenderer.invoke('tests:export', id),
  importTest: () => ipcRenderer.invoke('tests:import'),
  getVersion: () => ipcRenderer.invoke('app:version'),
  exportReportPdf: (payload) => ipcRenderer.invoke('report:export', payload)
}

contextBridge.exposeInMainWorld('api', api)
