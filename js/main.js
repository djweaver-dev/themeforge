'use strict'
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

function createWindow(){
    let win = new BrowserWindow({
        width: 900,
        height: 450,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadFile('../index.html')
}
app.whenReady().then(createWindow)