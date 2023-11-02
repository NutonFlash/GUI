require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');

const entryPoint = 'src/pages/login';
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            webSecurity: false,
        },
    });

    win.loadFile(entryPoint + '/index.html');
};

app.whenReady().then(() => {
    createWindow();
});
