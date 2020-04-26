'use strict'
const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');
const path = require('path');
const menu = require('./js/menu.js');
const editor = require('./js/editor.js');

//any benefit to using Map() instead of Object()?
const colorMap = {
    'editor-env-activity' : 'activityBar.background',
    'editor-env-sidebar' : 'sideBar.background',
    'editor-env-editor' : 'editor.background',
    'editor-env-panel' : 'panel.background',
    'editor-env-status' : 'statusBar.background'
}

let dataSet=null;

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
//sets our theme to UI elements after data has loaded
async function setTheme(importPath){
    dataSet = await importTheme(importPath);
    for(let [key, value] of Object.entries(colorMap)){
        document.getElementById(key)
                .style.backgroundColor =
                dataSet.colors[value];
    }
}

//TODO:expand this to set multiple complimentary
//colors for each vscode UI element
function setColor(key, color){
    console.log(`Changing ${colorMap[key]} from ${dataSet.colors[colorMap[key]]} to ${color}`)
    dataSet.colors[colorMap[key]] = color;
    
}

//sets our initial default theme
setTheme('default')

//this delegates a single click event within html 
//element to control the entire program
document.onclick = function(event) {
    let cmd = null;
    let targetId = event.target.id;
    let target = document.getElementById(targetId);
    let idArray = targetId.split('-');

    switch(idArray[0]){
        case 'menu':
            //menu routing module
            cmd = menu.control(targetId, idArray, target);

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
                    fs.writeFile(cmd.exportPath, JSON.stringify(dataSet), (error) => {
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
        case 'editor':
            //editor routing module
            cmd = editor.control(targetId, idArray, target);

            //editor command execution
            switch(cmd.action){
                case 'setColor':
                    cmd.color.then((value) => setColor(cmd.id, value))
                    break;
            }
            break;
    }
}
