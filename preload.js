const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (data) => ipcRenderer.invoke('save-file', data),
    openFile: () => ipcRenderer.invoke('open-file'),
    on: (channel, callback) => ipcRenderer.on(channel, (_, data) => callback(data)),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
