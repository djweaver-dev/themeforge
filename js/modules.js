'use strict'
const path2 = require('path');
const fs2 = require('fs');

const directoryPath = path2.join(__dirname, 'html');

// - - - H T M L   L O A D E R - - - //
//this loads various html modules that represent
//more complex elements that would clunk up
//our index.html.  The html data is injected into
//parent elements based on the file name which
//correlates to the id of the parent element
fs2.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err)
    } 
    console.log(files.length + " modules loaded.")
    files.forEach(file => {
        let target = file.slice(0, file.indexOf('.'))
        let htmlData = fs2.readFileSync(path2.resolve(directoryPath, file))
        document.getElementById(target).innerHTML = htmlData
    })
})

