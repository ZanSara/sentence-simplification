const { parentPort } = require('worker_threads');
const fs = require('fs');

// Get data to save from parent thread
parentPort.once("message", (message) => {

    console.log("Saving data to file '"+message.title+"'...");
    
    // store data gotten from main thread in database
    fs.writeFile("/home/s/projects/nlp/crawler-corpora/data/"+message.title+".txt", 
        message.textContent, function(err) {
        if(err) {
            return console.log(err);
        }
        parentPort.postMessage("Data saved successfully");
    });
});