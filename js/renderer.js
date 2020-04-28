'use strict'
const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');
const path = require('path');
const menu = require('./js/menu.js');
const editor = require('./js/editor.js');

const defaultPath = '../themeforge/themes/theme-forge-light/';

//any benefit to using Map() instead of Object()?
const colorMap = {
    'editor-env-activity' : 'activityBar.background',
    'editor-env-sidebar' : 'sideBar.background',
    'editor-env-editor' : 'editor.background',
    'editor-env-panel' : 'panel.background',
    'editor-env-status' : 'statusBar.background'
}
const dataMap = {};

let colorSet = {};
let dataSet = {};

//loads dataset
function importData(importPath){
    let data;
        data = JSON.parse
        (fs.readFileSync(path.resolve(__dirname,
            importPath)));
    return data;
}

//sets our theme to UI elements after data has loaded
async function setTheme(importPath){
    colorSet = await importData(importPath);
    for(let [key, value] of Object.entries(colorMap)){
        document.getElementById(key)
                .style.backgroundColor =
                colorSet.colors[value];
    }
}

//TODO:expand this to set multiple complimentary
//colors for each vscode UI element
function setColor(key, color){
    console.log(`Changing ${colorMap[key]} from ${colorSet.colors[colorMap[key]]} to ${color}`)
    colorSet.colors[colorMap[key]] = color;
}

function saveNewProject(name, savePath){
    let dirName = name.split(' ').join('-').toLowerCase();
    let fileName = name + '-color-theme.json';
    //TODO: create proper package.json
    let pkgData = {'my': 'json' };
    //TODO: create proper readme.md
    let rmeData = "# README";
    console.log(name)
    console.log(dirName)
    console.log(fileName)
    console.log(savePath)

    if (savePath === 'default'){
        savePath = `${process.cwd()}/themes/${dirName}`;
    } else {
        savePath += ("/"+dirName);
    }
    fs.mkdirSync(savePath+"/themes", {recursive: true})
    fs.writeFileSync(savePath+"/themes/"+fileName, JSON.stringify(colorSet, null, '\t'))
    fs.writeFileSync(savePath+"/package.json", JSON.stringify(pkgData))
    fs.writeFileSync(savePath+"/readme.md", rmeData)
}

//TODO: Error Handling for when the JSON contains invalid character
//try loading "luminoid dark" theme from "~"
async function loadProject(loadPath){
    //load JSON
        console.log("DEFAULT PATH IS: " +loadPath)
        dataSet = await importData(loadPath + "/package.json")

        //color-theme.json
        colorSet = await importData(loadPath + dataSet.contributes.themes[0].path.slice(1,dataSet.contributes.themes[0].path.length))
 //       console.log(colorSet)
        for(let [key, value] of Object.entries(colorMap)){
            document.getElementById(key)
                    .style.backgroundColor =
                    colorSet.colors[value];
        }
    //return({data, color})
}

//sets our initial default theme
//setTheme(defaultPath)
loadProject(defaultPath)


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
                case 'save':
                    saveNewProject(cmd.name, cmd.path)
                    break;
                case 'load':
                    loadProject(cmd.path)
                    break;
                //This generates the appropriate dialog module
                //within our projector div
                case 'dialog':
                    let dialogPath = path.resolve(__dirname, 'dialogs', (`${cmd.target}.html`))
                    document.getElementById('menu-dialog-projector').innerHTML = 
                    fs.readFileSync(dialogPath);
                    break;
                //importData loads our theme JSON into data object
                case 'importData':
                    // data = JSON.parse(fs.readFileSync(path.resolve(__dirname, cmd.importPath)));
                    // renderColors(data);
                    setTheme(cmd.importPath)
                    break;
                //Export and Export As of JSON
                case 'export':
                    fs.writeFile(cmd.exportPath, JSON.stringify(colorSet), (error) => {
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
