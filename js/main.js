'use strict'
const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain } = electron;

function createWindow(){
    let win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadFile('index.html')
    //Menu.setApplicationMenu(null)
}
app.whenReady().then(createWindow)