var request = require('request');
var { Readability } = require('@mozilla/readability');
var JSDOM = require('jsdom').JSDOM;

var START_URL = "https://blog.logrocket.com/how-to-build-a-web-crawler-with-node/";

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();




const { Worker, isMainThread, parentPort }  = require('worker_threads');

if (isMainThread) {
    const worker =  new Worker(__filename);
    worker.once('message', (message) => {
        console.log(message); // prints 'Worker thread: Hello!'
    });
    worker.postMessage('Main Thread: Hi!');
} else {
    parentPort.once('message', (message) => {
        console.log(message) // prints 'Main Thread: Hi!'
        parentPort.postMessage("Worker thread: Hello!");
    });
}




request(url, function(error, response, body) {
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        // Parse the document body
        var doc = new JSDOM(body, {
            url: url
        });
        let reader = new Readability(doc.window.document);
        let article = reader.parse();
        console.log(article);
 });






 function crawl() {
    console.log("Visiting "+numPagesVisited+"th page...");

    var nextPage = pagesToVisit.pop();
    if (nextPage in pagesVisited) {
      // We've already visited this page, so repeat the crawl
      crawl();
    } else {
      // New page we haven't visited
      visitPage(nextPage, crawl);
    }
  }
  
  function visitPage(url, callback) {
    // Add page to our set
    pagesVisited[url] = true;
    numPagesVisited++;
  
    // Make the request
    console.log("Visiting page " + url);
    request(url, function(error, response, body) {
       // Check status code (200 is HTTP OK)
       console.log("Status code: " + response.statusCode);
       if(response.statusCode !== 200) {
         callback();
         return;
       }
       // Parse the document body
       var $ = cheerio.load(body);
       var isWordFound = searchForWord($, SEARCH_WORD);
       if(isWordFound) {
         console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
       } else {
         collectInternalLinks($);
         // In this short program, our callback is just calling crawl()
         callback();
       }
    });
  }
  
  function searchForWord($, word) {
    var bodyText = $('html > body').text().toLowerCase();
    return(bodyText.indexOf(word.toLowerCase()) !== -1);
  }
  
  function collectInternalLinks($) {
      var relativeLinks = $("a[href^='/']");
      console.log("Found " + relativeLinks.length + " relative links on page");
      relativeLinks.each(function() {
          pagesToVisit.push(baseUrl + $(this).attr('href'));
      });
  }


