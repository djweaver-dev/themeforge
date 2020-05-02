'use strict'


function control(id, idArr, target) {

    switch(idArr[1]){
        case 'ext':
            document.querySelector('.dialog').classList.toggle('hidden')
            return({action: 'dialog', target: 'menu-dialog-input', label: idArr[2]+'-txt', edit: id})
        case 'env':
            //if env editor element is clicked, simulate click of
            //hidden colorPicker, change the environment UI element
            //to chosen color, and return setColor command to renderer
            //to update our JSON data.  A promise is initiated here
            //on the colorPicker change listener and passed into the
            //return object.  This prevents the previous color from
            //being written to JSON prior to the user choosing the
            //color
            let colorPicker = document.getElementById('env-picker');
            colorPicker.dispatchEvent(new MouseEvent('click'))
            let color = new Promise(resolve => {
                colorPicker.addEventListener("change", 
                e => { target.style.backgroundColor = e.target.value;
                    resolve(e.target.value)}, 
                {once: true});
            })
            return ({id, color, action: 'setColor'})
        case 'syn':
            return({action:null})
    }
}

module.exports.control = control;