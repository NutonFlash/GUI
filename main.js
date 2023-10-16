require('dotenv').config();

const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            webSecurity: false,
        },
    });

    win.loadFile('index.html');
};

app.whenReady().then(() => {
    createWindow();
});
