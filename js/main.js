'use strict'
const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain } = electron;
let win;
function createWindow(){
        win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadFile('index.html')
    Menu.setApplicationMenu(null)
}
app.whenReady().then(createWindow)

ipcMain.on('devtools', () => { 
    win.toggleDevTools() 
})
ipcMain.on('reload', () => {
    win.reload();
})
ipcMain.on('exit', () => { app.quit() })