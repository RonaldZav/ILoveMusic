const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const YTDlpWrap = require('yt-dlp-wrap').default;
const { spawn } = require('child_process');
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
    console.log('Playing audio from query:', query);

    try {
        // Inicializar yt-dlp
        const ytDlpWrap = new YTDlpWrap(ytDlpBinaryPath);

        // Obtener la duración del video
        const videoInfo = await ytDlpWrap.exec(['--get-duration', query]);

        // Asegurarse de que videoInfo sea una cadena
        const durationStr = videoInfo.toString().trim();
        const duration = parseFloat(durationStr);
        if (isNaN(duration)) {
            throw new Error('No se pudo obtener la duración del video');
        }

        // Convertir la duración a milisegundos
        const durationMs = duration * 1000;

        // Ejecutar yt-dlp y obtener el stream de audio en formato webm
        const ytDlpStream = ytDlpWrap.execStream([
            query,
            '-f', 'bestaudio/best',
            '--no-playlist'
        ]);

        // Convertir el audio webm a pcm_s16le con ffmpeg
        const ffmpeg = spawn('ffmpeg', [
            '-analyzeduration', '1M', // Ajustar la duración del análisis
            '-probesize', '1M', // Ajustar el tamaño del buffer de análisis
            '-i', 'pipe:0', // Leer desde el stdin
            '-f', 's16le',
            '-ac', '2',
            '-ar', '44100',
            'pipe:1' // Escribir al stdout
        ]);

        // Configurar el reproductor de audio
        const speaker = new Speaker({
            channels: 2, // Estéreo
            bitDepth: 16,
            sampleRate: 44100
        });

        // Conectar las tuberías
        ytDlpStream.pipe(ffmpeg.stdin);
        ffmpeg.stdout.pipe(speaker);

        // Manejar errores
        ffmpeg.on('error', (error) => {
            console.error('FFmpeg error:', error);
        });

        ytDlpStream.on('error', (error) => {
            console.error('yt-dlp stream error:', error);
        });

        speaker.on('error', (error) => {
            console.error('Speaker error:', error);
        });

        // Capturar salida y errores de ffmpeg
        ffmpeg.stderr.on('data', (data) => {
            console.error(`FFmpeg stderr: ${data.toString()}`);
        });

        // Manejar el cierre de los flujos
        ytDlpStream.on('close', () => {
            console.log('yt-dlp stream closed');
        });

        ffmpeg.on('close', (code) => {
            console.log('FFmpeg process closed with code:', code);
        });

        // Cerrar ffmpeg después del tiempo máximo
        setTimeout(() => {
            ffmpeg.kill();
            console.log('FFmpeg process terminated due to timeout');
        }, durationMs);

        console.log('Streaming and converting audio...');
    } catch (error) {
        console.error('Error handling youtube-query:', error);
    }
});
