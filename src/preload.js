const { contextBridge, ipcRenderer } = require('electron');

const GENIUS_API_KEY = '-ZC7cpSxQGRFzt76fQ7ApKhSW1KLT3S3k4C7t6A_PeTya83bJx501ryGf1Jf3t1j'; // Your Genius API Client Access Token

contextBridge.exposeInMainWorld('electron', {
  selectMusicFile: () => ipcRenderer.invoke('select-music-file'),
  selectLyricsFile: () => ipcRenderer.invoke('select-lyrics-file'),
  getGeniusApiKey: () => GENIUS_API_KEY // Return the API key directly
});
