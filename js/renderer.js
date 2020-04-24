'use strict'
const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');

document.onclick = function(event) {
    let targetId = event.target.id;
    let target = document.getElementById(targetId);
    let targetCl = target.classList;
    let childId, child = null;
    if(target.firstElementChild) {
        childId = target.firstElementChild.id;
        child = document.getElementById(childId);
    }
    let idArray = targetId.split('-');
    console.log(idArray);
    console.log(targetCl);
    //check if menu has submenu, if so, toggle visibility
    if(idArray[0] === 'menu') {
        if(childId) child.classList.toggle('hidden');
    }
    switch(idArray[0]){
        case 'menu':
            //modularized function to control menu
            //menuControl(idArray);
            break;
        case 'edit':
            //modularized function to control editor
            //editControl(idArray);
            break;
    }

}
