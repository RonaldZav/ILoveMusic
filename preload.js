const { contextBridge, ipcRenderer } = require('electron');
const events = require('./eventsLoader.js');

// Exponer una API segura al contexto de la página
contextBridge.exposeInMainWorld('api', {
    triggerEvent: (eventName, eventData) => {
        ipcRenderer.send('trigger-event', eventName, eventData);
    }
});

// Registrar eventos
for (const [eventName, event] of Object.entries(events)) {
    ipcRenderer.on(eventName, (e, eventData) => {
        event.run(eventData);
    });
}
