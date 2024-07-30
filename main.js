const { app, BrowserWindow, ipcMain, contextBridge } = require('electron');
const path = require('path');
const { LavalinkManager } = require('lavalink-client');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 600,
        minWidth: 800,
        maxHeight: 600,
        maxWidth: 800,
        autoHideMenuBar: true,
        title: "ILoveMusic",
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

    win.loadFile('views/index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Configurar LavaLink
    const node = new LavalinkManager({
        nodes: [
            {
                host: 'buses.sleepyinsomniac.eu.org',
                port: 80,
                authorization: 'youshallnotpass',
                id: "2008"
            }
        ],
        sendToShard: (guildId, payload) =>
            client.guilds.cache.get(guildId)?.shard?.send(payload),
        client: {
            id: "2008",
            username: "ILoveMusic",
        },
        autoSkip: true,
        playerOptions: {
            clientBasedPositionUpdateInterval: 150,
            defaultSearchPlatform: "ytmsearch",
            volumeDecrementer: 0.75,
            onDisconnect: {
                autoReconnect: true, 
                destroyPlayer: false 
            },
            onEmptyQueue: {
                destroyAfterMs: 30_000, 
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
        setupPlayer(); // Mueve la creación del reproductor aquí para asegurarte de que el nodo esté listo.
    });

    node.on('trackStart', (player, track) => {
        console.log('Track started:', track.title);
    });

    node.on('trackEnd', (player, track, reason) => {
        console.log('Track ended:', track.title, reason);
    });

    function setupPlayer() {
        const player = node.players.get('myMusicPlayer') || node.createPlayer({
            guildId: "2008", 
            voiceChannelId: "42365236722", 
            textChannelId: "464572345437453198", 
            volume: 100,
            instaUpdateFiltersFix: true,
            applyVolumeAsFilter: false,
        });

        // Exponer el player al contexto del renderer
        contextBridge.exposeInMainWorld('player', player);
    }

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});