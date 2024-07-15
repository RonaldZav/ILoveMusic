const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getEvents: async () => {
    return await ipcRenderer.invoke('getEvents');
  },
  "navegator-search": async (query) => {
    const result = await ipcRenderer.invoke('navegator-search', query);
    if (result.success) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(new Audio(result.track.url));
      source.connect(audioContext.destination);
      source.mediaElement.play();
    }
    return result;
  },
});
