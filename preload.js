const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onButtonClick: (callback) => {
    window.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        callback(event.target.id);
      }
    });
  }
});
