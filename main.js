const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const events = require('./eventsLoader');
const { LavalinkManager } = require('lavalink-client');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 800,
    autoHideMenuBar: true,
    title: "ILoveMusic",
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
  }
  })

  win.loadFile('views/index.html')

  win.webContents.on('did-finish-load', () => {
    for (const [eventName, event] of Object.entries(events)) {
        win.webContents.on(event.type, (e) => {
            // Verificar si el id del elemento que generó el evento coincide con el nombre del evento
            if (e.target && e.target.id === eventName) {
                event.run(e);
            }
        });
    }
  });

}

app.whenReady().then(() => {
  app.whenReady().then(createWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Configurar NodeLink
const node = new LavalinkManager({
    nodes: [
        { // Important to have at least 1 node
            host: 'buses.sleepyinsomniac.eu.org',
            port: 80,
            authorization: 'youshallnotpass',
            id: "myLavalinkNode"
        }
    ],
    sendToShard: (guildId, payload) =>
        client.guilds.cache.get(guildId)?.shard?.send(payload),
    client: {
        id: "2008",
        username: "ILoveMusic",
    },
    // everything down below is optional
    autoSkip: true,
    playerOptions: {
        clientBasedPositionUpdateInterval: 150,
        defaultSearchPlatform: "ytmsearch",
        volumeDecrementer: 0.75,
        //requesterTransformer: requesterTransformer,
        onDisconnect: {
            autoReconnect: true, 
            destroyPlayer: false 
        },
        onEmptyQueue: {
            destroyAfterMs: 30_000, 
            //autoPlayFunction: autoPlayFunction,
        }
    },
    queueOptions: {
        maxPreviousTracks: 25
    },
});

  node.init({ id: "2008", username: "ILoveMusic" });

  node.on('error', (error) => {
    console.error('Lavalink node error:', error);
  });
  
  node.on('ready', () => {
    console.log('Lavalink node is ready');
  });
  
  node.on('trackStart', (player, track) => {
    console.log('Track started:', track.title);
  });
  
  node.on('trackEnd', (player, track, reason) => {
    console.log('Track ended:', track.title, reason);
  });
  
  ipcMain.handle('search', async (event, query) => {
    const player = node.players.get('myMusicPlayer') || await node.createPlayer({
        guildId: "2008", 
        voiceChannelId: "42365236722", 
        textChannelId: "464572345437453198", 
        volume: 100,
        instaUpdateFiltersFix: true,
        applyVolumeAsFilter: false,
    });
  
    try {
        const res = await player.search({
            query: query,
            source: "ytmsearch"
          }, { id: "2008", username: "ILoveMusic" });
          
      const track = res.tracks[0];
  
      if (track) {
        return { success: true, track };
      } else {
        return { success: false, error: 'Track not found' };
      }
    } catch (error) {
      console.error('Error playing track:', error);
      return { success: false, error: 'An error occurred while playing the track.' };
    }
  });
  