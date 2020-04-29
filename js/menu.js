'use strict'
const remote = require('electron').remote 
const dialog = remote.dialog;

let currentPath = '/themes/default.json';

function control(id, idArr, target, inputTarg) {
    switch(idArr[1]){

        // - - - S U B M E N U   R O U T I N G - - - //
        //submenu button clicks are routed here
        //all other menu items either activate anchors
        //(see case: 'anchor') or are the parent buttons
        //of submenus (see default:)
        case 'subm':

            //hides our submenu on clicking submenu button
            let hideId = (`${idArr[0]}-${idArr[1]}-${idArr[2]}`);
            document.getElementById(hideId).classList.toggle('hidden')
            switch(idArr[2]){

                //file submenu returns import, export, or exit
                //commands back to the renderer for execution
                case 'file':
                    switch(idArr[3]){
                        case 'new':
                            document.querySelector('.dialog').classList.toggle('hidden')
                            return ({action: 'dialog', target: `${idArr[0]}-dialog-${idArr[3]}`})
                        case 'load':
                            document.querySelector('.dialog').classList.toggle('hidden')
                            return ({action: 'dialog', target: `${idArr[0]}-dialog-${idArr[3]}`})
                        case 'save':
                            console.log('save clicked')
                            return ({action: 'save', path: 'working', name: 'current'})
                        case 'saveas':
                            return ({action: null})
                        case 'import':
                            let importPath = dialog.showOpenDialogSync({properties: ['openFile']}).toString();
                            currentPath = importPath;
                            return ({action:'import', importPath})
                        case 'export':
                            //TODO: create confirmation prompt
                            return ({action:'export', exportPath: currentPath})
                        case 'exportas':
                            let exportPath = dialog.showSaveDialogSync({properties: ['openFile']});
                            return ({action:'export', exportPath})
                        case 'exit':
                            return ({action: 'exit'})
                    }

                //help submenu returns create window commands that
                //pertain to opening help/documentation windows
                case 'help':
                    
                    switch(idArr[3]){
                        case 'quickstart':
                            return ({action: 'create'})
                        case 'documentation':
                            return ({action: 'create'})
                        case 'reportbug':
                            return ({action: 'create'})
                        case 'about':
                            return({action: 'nav', target: 'anchor-abt'})
                    }

                //dev submenu activates development tools and will
                //not be accessible in production environment  
                case 'dev':
                    
                    switch(idArr[3]){
                        case 'devtools':
                            return ({action: 'devtools'})
                        case 'reload':
                            return ({action: 'reload'})
                    }
            }

        // - - - A N C H O R   B U T T O N   R O U T I N G - - - //
        //this returns a target id for anchor elements
        //within the page that scroll to different sections
        case 'anchor':
            return ({
                action: 'nav',
                target: idArr[1] + '-' + idArr[2]
            })

        // - - - D I A L O G   R O U T I N G - - - //
        case 'dialog':
            switch(idArr[2]){
                case 'projector':
                    console.log('hiding dialog')
                    document.getElementById(id).classList.toggle('hidden')
                    return {action: null}
                
                //This handles our new project dialog
                case 'new':
                    let nameText = document.getElementById('menu-dialog-new-name')
                    let pathText = document.getElementById('menu-dialog-new-path')
                    switch(idArr[3]){
                        case 'accept':
                            if(nameText.value === ''){
                                alert('Please enter name')
                                return({action:null})
                            }
                            if(pathText.value === ''){
                                pathText.value = 'default';
                            } 
                            document.querySelector('.dialog').classList.toggle('hidden')
                            return ({ 
                                action: 'save', 
                                name: nameText.value,
                                path: pathText.value
                            })
                        case 'cancel':
                            document.querySelector('.dialog').classList.toggle('hidden')
                            return ({action: null})
                        case 'path':
                            pathText.value = dialog.showOpenDialogSync({
                                properties: ['openDirectory']
                            });
                            return ({action: 'setWorkingDir', path: pathText})
                    }
                case 'load':
                    let loadText = document.getElementById('menu-dialog-load-path')
                    switch(idArr[3]){
                        case 'accept':
                            if(loadText.value === '' || loadText.value === 'undefined'){
                                alert('Please choose theme folder')
                                return ({action: null})
                            } 
                            document.querySelector('.dialog').classList.toggle('hidden')
                            return ({ 
                                action: 'load', 
                                path: loadText.value
                            })
                        case 'cancel':
                            document.querySelector('.dialog').classList.toggle('hidden')
                            return ({action: null})
                        case 'path':
                            loadText.value = dialog.showOpenDialogSync({properties: ['openDirectory']})
                            if(loadText.value === 'undefined') {
                                loadText.value = "";
                                return ({action: null})
                            } else return ({action: 'setWorkingDir', path: loadText.value})
                    }
                case 'input':
                    let inputText = document.getElementById('menu-dialog-input-text')
                    switch(idArr[3]){
                        case 'accept':
                            if(inputText.value === '' || inputText.value === 'undefined'){
                                alert('Please enter text.')
                                return ({action: null})
                            }
                            document.getElementById(inputTarg).value = inputText.value;
                            document.querySelector('.dialog').classList.toggle('hidden')
                            return ({action: 'setText', target: inputTarg}) 
                        case 'cancel':
                            document.querySelector('.dialog').classList.toggle('hidden')
                            return ({action: null})
                    }
                return ({action: null})
            }

        // - - - S U B M E N U   D R A W E R - - - //
        //This is the submenu drawer logic that opens
        //the focused submenu while closing the others
        default: {

            //check for child menu
            let childId, child = null;
            if(target.firstElementChild) {
                childId = target.firstElementChild.id;
                child = document.getElementById(childId);
                if(childId.substring(5,9)==='subm') {
                    if(child.classList.contains('hidden')){
                        //make all other submenus invisible
                        let otherList = document.querySelectorAll('.submenu');
                        for(let i = 0; i < otherList.length; i++){
                            otherList[i].classList.add('hidden')
                        }
                        //make child visible
                        child.classList.remove('hidden')
                        //check if mouse leaves target or its child
                        //and hide menu if it does
                        target.addEventListener('mouseleave', () => {
                            child.classList.add('hidden')
                        })
                    } else {
                        child.classList.add('hidden')                        
                    }
                }
            }
        }
        //return a null action for edge-case clicks
        return({action:null})
    }
}

module.exports.control = control;