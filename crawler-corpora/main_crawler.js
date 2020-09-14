const axios = require('axios').default;
const { Worker, isMainThread, parentPort }  = require('worker_threads');
var { Readability, isProbablyReaderable } = require('@mozilla/readability');
var JSDOM = require('jsdom').JSDOM;


var START_URL = "https://blog.logrocket.com/how-to-build-a-web-crawler-with-node/";
var MAX_PAGES_TO_VISIT = 3;

var pagesVisited = [];
var numPagesVisited = 0;
var pagesToVisit = [];

let workDir = "/home/s/projects/nlp/crawler-corpora/worker_crawler.js";

pagesToVisit.push(START_URL);
crawl();


function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  const nextPage = pagesToVisit.pop();
  if (!nextPage || pagesVisited.includes(nextPage)) {
    // We've already visited this page, so repeat the crawl
    crawl();

  } else {
    // New page we haven't visited
    console.log("------------------->", nextPage);
    axios.get(nextPage).then(function (response) {

        // Push current page to visited pages
        pagesVisited.push(nextPage);
        numPagesVisited += 1;
        
        // Check status code
        if(response.status !== 200) {
            console.log("This page returned a code "+response.status+": "+nextPage);
            return;
        }

        // Parse the document body
        var dom = new JSDOM(response.data, {
            url: nextPage
        });

        // Extract all links and push them back to the list of pages to crawl
        const nodeList = [...dom.window.document.querySelectorAll('a')];
        nodeList.forEach(link => {pagesToVisit.push(link.href.split("#")[0])});
        
        // Check the readerability
        if (!isProbablyReaderable(dom.window.document)) {
            console.log("This page is not 'readerable' : "+nextPage);
            return;
        }

        // Read the page
        let reader = new Readability(dom.window.document);
        text = reader.parse();

        // Send data to worker to be saved
        const worker = new Worker(workDir); 
        worker.postMessage(text);

    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
    .then(function () {
       // Keep crawling - always executed
       crawl();
    });
  }
}