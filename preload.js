const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onButtonClick: (callback) => {
    window.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        callback(event.target.id);
      }
    });
  },
  sendQuery: (query) => {
    console.log('Sending query:', query); // Verifica si esta línea se imprime en la consola del renderer
    ipcRenderer.send('youtube-query', query);
  }
});
