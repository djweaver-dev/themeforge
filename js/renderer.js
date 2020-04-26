'use strict'
const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');
const path = require('path');
const menu = require('./js/menu.js');
//const editor = require('./js/editor.js');

//loads dataset
function importTheme(importPath){
    let data;
    if(importPath === 'default'){
        data = JSON.parse
        (fs.readFileSync(path.resolve(__dirname,
            '../themeforge/themes/default.json')));
    } else {
        data = JSON.parse
        (fs.readFileSync(path.resolve(__dirname,
            importPath)));
    }
    return data;
}
async function setTheme(importPath){
    let colorMap = [
        { editor: 'env-activity', data: 'activityBar.background' },
        { editor: 'env-sidebar', data: 'sideBar.background' },
        { editor: 'env-editor', data: 'editor.background' },
        { editor: 'env-panel', data: 'panel.background' },
        { editor: 'env-status', data: 'statusBar.background' }
    ]
    let dataSet = await importTheme(importPath);
    for(let i = 0; i < colorMap.length; i++){
        document.getElementById
        (colorMap[i].editor).style.backgroundColor =
        dataSet.colors[colorMap[i].data];
    }
}

//sets our initial default theme
setTheme('default')

//this delegates a single click event within html 
//element to control the entire program
document.onclick = function(event) {
    let targetId = event.target.id;
    let target = document.getElementById(targetId);
    let idArray = targetId.split('-');
    console.log(idArray)

    switch(idArray[0]){
        case 'menu':
            //menu routing module
            let cmd = menu.control(targetId, idArray, target);

            //menu command execution
            switch(cmd.action){
                //import loads our theme JSON into data object
                case 'import':
                    // data = JSON.parse(fs.readFileSync(path.resolve(__dirname, cmd.importPath)));
                    // renderColors(data);
                    setTheme(cmd.importPath)
                    break;
                //export handles Save and Save As
                case 'export':
                    fs.writeFile(cmd.exportPath, JSON.stringify(data), (error) => {
                        console.log(cmd.exportPath);
                        if(error) console.log('whoopsie!')
                    })
                    break;
                //nav simulates clicks on hidden anchors
                case 'nav':
                    document.getElementById(cmd.target)
                    .dispatchEvent(new MouseEvent('click'))
                    break;
                //sends exit cmd to main
                case 'exit':
                    console.log('exit command received')
                    ipcRenderer.send('exit')
                    break;
                //sends devtools cmd to main
                case 'devtools':
                    ipcRenderer.send('devtools')
                    break;
                //sends refresh cmd to main
                case 'reload':
                    ipcRenderer.send('reload')
                    break;
                //any unaccounted for clicks log id 
                //of element to console
                default: 
                    console.log(`${cmd.action} action from id="${targetId}"`)
                    break;
            }
            break;
        case 'edit':
            //modularized function to control editor
            //let cmd = editor.control(targetId, idArray, target);
            break;
    }
}
