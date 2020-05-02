'use strict'
const path = require('path');
const fs = require('fs');
const electron = require('electron');
const { ipcRenderer } = electron;
const menu = require('./js/menu.js');
const editor = require('./js/editor.js');

// - - - H T M L   I N J E C T O R - - - //
//this loads various html modules that represent
//more complex elements that would clunk up
//our index.html.  The html data is injected into
//parent elements based on the file name which
//correlates to the id of the parent element
async function renderHTML(){
    const directoryPath = path.join(process.cwd(), 'html');
    const files = fs.readdirSync(directoryPath)
    files.forEach(file => {
        let target = file.slice(0, file.indexOf('.'))
        let htmlData = fs.readFileSync(path.resolve(directoryPath, file))
        document.getElementById(target).innerHTML = htmlData
    })
    console.log(files.length + " modules loaded.")
}

const defaultPath = './themes/theme-forge-light/';

//any benefit to using Map() instead of Object()?
const colorMap = {
    'editor-env-activity' : 'activityBar.background',
    'editor-env-sidebar' : 'sideBar.background',
    'editor-env-editor' : 'editor.background',
    'editor-env-panel' : 'panel.background',
    'editor-env-status' : 'statusBar.background'
}
const dataMap = {
    'editor-ext-name': 'displayName',
    'editor-ext-author': 'publisher',
    'editor-ext-version': 'version',
    'editor-ext-repo': 'repository.url',
    'editor-ext-desc': 'description'
};

let colorSet = {};
let dataSet = {};
let inputTarg;
let workingDir;

//loads dataset
function importData(importPath){
    let data = JSON.parse(fs.readFileSync(path.resolve(__dirname, importPath)));
    return (data);
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

function setText(key){
//    console.log(`Changing ${dataMap[key]} from ${dataSet.colors[dataMap[key]]} to ${document.getElementById(key).value}`)
    dataSet[dataMap[key]] = document.getElementById(key).value;
    console.log(dataSet['publisher'])
}

async function saveProject(name, savePath){
    let dirName = name.split(' ').join('-').toLowerCase();
    let fileName = name + '-color-theme.json';
    //TODO: create proper package.json
    dataSet.name = dirName;
    dataSet.displayName = name;
    dataSet.contributes.themes[0].path = "./themes/"+fileName;
    //TODO: create proper readme.md
    let rmeData = "# README";
    if (savePath === 'default'){
        savePath = `${process.cwd()}/themes/${dirName}`;
        dataSet.contributes.themes[0].path =`./themes/${fileName}`;
    // } else {
    //     savePath += ("/"+dirName);
    }
    fs.mkdirSync(savePath+"/themes", {recursive: true})
    fs.writeFileSync(savePath+"/themes/"+fileName, JSON.stringify(colorSet, null, '\t'))
    fs.writeFileSync(savePath+"/package.json", JSON.stringify(dataSet, null, '\t'))
    fs.writeFileSync(savePath+"/readme.md", rmeData)
    workingDir = savePath;
    console.log("SAVE DIRECTORY: " + workingDir)
}

//TODO: Error Handling for when the JSON contains invalid character
//try loading "luminoid dark" theme from "~"
async function loadProject(loadPath){
        workingDir = loadPath;
        console.log('WORKING DIR: '+ workingDir)
        dataSet = importData(loadPath + "/package.json")
        colorSet = importData(loadPath + dataSet.contributes.themes[0].path.slice(1,
                                dataSet.contributes.themes[0].path.length))
        for(let [key, value] of Object.entries(colorMap)){
            document.getElementById(key)
                    .style.backgroundColor =
                    colorSet.colors[value];
        }

        for(let [key, value] of Object.entries(dataMap)){
            document.getElementById(key).value = dataSet[value];
        }
        document.getElementById('editor-ext-path').value = process.cwd() + loadPath;

}

renderHTML().then(()=> loadProject(defaultPath))

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
            cmd = menu.control(targetId, idArray, target, inputTarg);

            //menu command execution
            switch(cmd.action){
                case 'save':
                    if(cmd.path === 'working') cmd.path = workingDir;
                    if(cmd.name === 'current') cmd.name = dataSet.displayName;
                    saveProject(cmd.name, cmd.path).then(()=>loadProject(workingDir))
                    break;
                case 'load':
                    loadProject(cmd.path)
                    break;
                case 'setWorkingDir':
                    workingDir = cmd.path;
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
                case 'setText':
                    setText(cmd.target)
                    break;
                //any unaccounted for clicks log id 
                //of element to console
                default: 
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
                case 'dialog':
                    let dialogPath = path.resolve(__dirname, 'dialogs', (`${cmd.target}.html`))
                    document.getElementById('menu-dialog-projector').innerHTML = 
                    fs.readFileSync(dialogPath);
                    document.getElementById('dialog-input-header').innerText = 
                    document.getElementById(cmd.label).innerText;
                    inputTarg = cmd.edit;
                    break;
                default:
                    console.log(targetId)
            }
            break;
    }
}
