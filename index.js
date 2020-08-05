var Crawler = require("crawler");
let jsdom = require("jsdom");
const { JSDOM } = jsdom;
 
var c = new Crawler();
// const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];
const alphabet = [...'abc'];
let results = [];

let tcgCrawl = new Promise((resolve, reject) => {
    alphabet.forEach((el, index, array) => {
        c.queue([{
            uri: `https://www.instantcheckmate.com/people/${el}/`,
            jQuery: false,
            rateLimit: 2000,
            maxConnections: 26,
         
            callback: function (error, res, done) {
        
                if (error) {
                    console.log(error);
                } else {
        
                    let dom = new JSDOM(res.body);
        
                    dom.window.document.querySelectorAll(".bc-a").forEach(el => {
                        results.push('https://www.truthfinder.com' + el.getAttribute('href'));
                    });
                    
                }
                done();

                if (index === array.length - 1) {
                    resolve();
                }
            }

        }]);
    });
});

tcgCrawl.then(() => {
    console.log(results);
});