'use strict'
const fs = require('fs');
const remote = require('electron').remote 
const dialog = remote.dialog;

let currentPath = '/themes/default.json';

function control(id, idArr, target) {
    switch(idArr[1]){

        // - - - S U B M E N U   R O U T I N G - - - //
        //submenu button clicks are routed here
        //all other menu items either activate anchors
        //(see case: 'anchor') or are the parent buttons
        //of submenus (see default:)
        case 'subm':
            switch(idArr[2]){

                //file submenu returns import, export, or exit
                //commands back to the renderer for execution
                case 'file':
                    switch(idArr[3]){
                        case 'import':
                            let importPath = dialog.showOpenDialogSync({properties: ['openFile']});
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

        // - - - S U B M E N U   D R A W E R - - - //
        default: {

            //This is the submenu drawer logic it opens
            //the focused submenu while closing the others

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
        return({action:null})
    }
}

module.exports.control = control;