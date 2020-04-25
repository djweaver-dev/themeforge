'use strict'
const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');
const menu = require('./js/menu.js');

document.onclick = function(event) {
    let targetId = event.target.id;
    let target = document.getElementById(targetId);
    let idArray = targetId.split('-');

    switch(idArray[0]){
        case 'menu':
            //menu routing module
            let command = menu.control(targetId, idArray, target);

            //menu command execution
            switch(command.action){
                case 'import':
                    break;
                case 'export':
                    break;
                case 'nav':
                    document.getElementById(command.target)
                    .dispatchEvent(new MouseEvent('click'))
                    break;
                case 'exit':
                    console.log('exit command received')
                    ipcRenderer.send('exit');
                    break;
                case 'devtools':
                    ipcRenderer.send('devtools');
                    break;
                default: 
                    console.log(`${command.action} action from id="${targetId}"`)
                    break;
            }
            break;
        case 'edit':
            //modularized function to control editor
            //editControl(idArray);
            break;
    }
}
