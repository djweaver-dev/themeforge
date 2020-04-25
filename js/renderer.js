'use strict'
const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');
const path = require('path');
const menu = require('./js/menu.js');

//loads default dataset
let data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../themeforge/themes/default.json')))

function renderColors(dataSet){
    // let envElems = document.querySelectorAll('.env');
    // for(let i = 0; i < envElems.length; i++){
    //     //do something something
    // }
    document.getElementById('env-activity').style.backgroundColor =
    dataSet.colors['activityBar.background'];
    document.getElementById('env-sidebar').style.backgroundColor =
    dataSet.colors['sideBar.background'];
    document.getElementById('env-editor').style.backgroundColor =
    dataSet.colors['editor.background'];
    document.getElementById('env-panel').style.backgroundColor =
    dataSet.colors['panel.background'];
    document.getElementById('env-status').style.backgroundColor =
    dataSet.colors['statusBar.background'];
}

renderColors(data)



//this delegates a single click event within html 
//element to control the entire program
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
                //import loads our theme JSON into data object
                case 'import':
                    data = JSON.parse(fs.readFileSync(path.resolve(__dirname, command.importPath)));
                    renderColors(data);
                    console.log(command.importPath + " loaded")
                    break;
                //export handles Save and Save As
                case 'export':
                    fs.writeFile(command.exportPath, JSON.stringify(data), (error) => {
                        console.log(command.exportPath);
                        if(error) console.log('whoopsie!');
                    });
                    break;
                //nav simulates clicks on hidden anchors
                case 'nav':
                    document.getElementById(command.target)
                    .dispatchEvent(new MouseEvent('click'))
                    break;
                //sends exit command to main
                case 'exit':
                    console.log('exit command received')
                    ipcRenderer.send('exit');
                    break;
                //sends devtools command to main
                case 'devtools':
                    ipcRenderer.send('devtools');
                    break;
                //sends refresh command to main
                case 'reload':
                    ipcRenderer.send('reload');
                    break;
                //any unaccounted for clicks log id 
                //of element to console
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
