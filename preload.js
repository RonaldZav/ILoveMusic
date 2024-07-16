const { contextBridge, ipcRenderer } = require('electron');

// Exponer una API segura al contexto de la página
contextBridge.exposeInMainWorld('api', {
    triggerEvent: (eventName, eventData) => {
        ipcRenderer.send(eventName, eventData);
    }
});
