const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  selectMusicFile: () => ipcRenderer.invoke('select-music-file'),
  selectLyricsFile: () => ipcRenderer.invoke('select-lyrics-file')
});
