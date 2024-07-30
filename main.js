const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const YTDlpWrap = require('yt-dlp-wrap').default;
const { PassThrough } = require('stream');
const Speaker = require('speaker');

// Ruta al binario de yt-dlp
const ytDlpBinaryPath = path.join(__dirname, 'utils/yt-dlp');

// Crear la ventana principal
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        title: "ILoveMusic",
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
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
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Manejo del evento youtube-query
ipcMain.on('youtube-query', async (event, query) => {
    console.log('Received query from renderer:', query);

    try {
        // Inicializar yt-dlp
        const ytDlpWrap = new YTDlpWrap(ytDlpBinaryPath);

        // Ejecutar yt-dlp y obtener el stream de audio
        const readableStream = ytDlpWrap.execStream([
            query,
            '-f', 'bestaudio/best', // Obtén el mejor audio disponible
            '--no-playlist', // Si deseas obtener solo el video en lugar de una lista de reproducción
            '--audio-format', 'mp3' // Especificar formato para evitar problemas de codec
        ]);

        // Configurar el reproductor de audio
        const speaker = new Speaker({
            channels: 2, // Cambia a 1 para mono si es necesario
            bitDepth: 16,
            sampleRate: 44100
        });

        // Reproducir el audio
        readableStream.pipe(speaker);

        readableStream.on('error', (error) => {
            console.error('Error in readableStream:', error);
        });

        console.log('Playing audio from query:', query);
    } catch (error) {
        console.error('Error handling youtube-query:', error);
    }
});
