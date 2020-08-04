var Crawler = require("crawler");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
 
var c = new Crawler();
const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];
let results = [];

new Promise((resolve, reject) => {
    alphabet.forEach(el => {
        c.queue([{
            uri: 'https://www.instantcheckmate.com/people/s/',
            jQuery: false,
            rateLimit: 2000,
            maxConnections: 1,
         
            callback: function (error, res, done) {
        
                if (error) {
                    console.log(error);
                } else {
        
                    const dom = new JSDOM(res.body);
        
                    dom.window.document.querySelectorAll(".bc-a").forEach(el => {
                        results.push('https://www.truthfinder.com' + el.getAttribute('href'));
                    });
                    
                }
                done();
                resolve();
            }
        }]);
    });
}).then(() => {
    console.log(results);
});