var Crawler = require("crawler");
let jsdom = require("jsdom");
let fs = require("fs");
const { JSDOM } = jsdom;

// TODO 
// last xml tag only working some of the time
// maybe put all files in a folder
// log stuff on completion
//    * # of sitemaps created
//    * sitemap name, # of entries for each

const sitemapPrefix = 'icm-ppl-pdnames-sitemap-';
let sitemapSuffix   = 1;

const sitemapHeader = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const sitemapFooter = '\n</urlset>';
const wrapStart     = '\n\t<url>\n\t\t<loc>';
const wrapEnd       = '</loc>\n\t</url>';

// const letters       = [...'abcdefghijklmnopqrstuvwxyz'];
const letters       = [...'abc'];
let lastNameURLS    = [];
let entryCounter    = 0;

let c = new Crawler();

function initialize() {
    return new Promise((resolve, reject) => {
        // if sitemap already exists, delete it.
        if (fs.existsSync(`${sitemapPrefix}.xml`)) {
            fs.unlinkSync(`${sitemapPrefix}.xml`);
        }

        // create empty file
        // fs.openSync(`${sitemapPrefix}.xml`, 'w');

        // fs.appendFile(`${sitemapPrefix}.xml`, sitemapHeader, function () {
            resolve();
        // });

    });
}


// crawl letter pages to retrieve last name URLs and add these to an array
function initialCrawl() {
    return new Promise((resolve, reject) => {
        console.log('Crawl started...');
        letters.forEach((letter, index, array) => {
            c.queue([{
                uri: `https://www.instantcheckmate.com/people/${letter}/`,
                jQuery: false,
                rateLimit: 2000,
                maxConnections: 26,
            
                callback: function (error, res, done) {
            
                    if (error) {
                        console.log(error);
                    } else {
            
                        let dom = new JSDOM(res.body);
            
                        dom.window.document.querySelectorAll(".bc-a").forEach((path, ind, arr) => {
                            lastNameURLS.push(`https://www.instantcheckmate.com${path.getAttribute('href')}`);

                            // resolve promise when forEach iteration is complete
                            if (index === array.length - 1 && ind === arr.length - 1) {
                                resolve();
                            }
                        });
                        
                    }

                    done();
                }

            }]);
        });
    });
}


// crawl last name pages and write result page URLs to sitemap
function secondCrawl() {
    return new Promise ((resolve, reject) => {
        lastNameURLS.forEach((el, i, arr) => {
            c.queue([{
                uri: `${el}`,
                jQuery: false,
                rateLimit: 2000,
                maxConnections: 26,
            
                callback: function (error, res, done) {
            
                    if (error) {
                        console.log(error);
                    } else {
            
                        let dom = new JSDOM(res.body);
            
                        dom.window.document.querySelectorAll(".bc-a").forEach((path, ind, ar) => {
                            // max number of entries for an XML files is 50,000
                            if (entryCounter > 10000) {
                                entryCounter = 0;
                                sitemapSuffix++;
                            }

                            // add sitemapHeader
                            if (entryCounter === 0) {
                                fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix}.xml`, sitemapHeader);
                            }

                            fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix}.xml`, `${wrapStart}https://www.instantcheckmate.com${path.getAttribute('href')}${wrapEnd}`);

                            // add sitemapFooter
                            // if (entryCounter === 10000 || (ind === ar.length - 1 && i === arr.length - 1)) {
                            //     fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix}.xml`, sitemapFooter);
                            // }

                            // resolve promise when forEach iteration is complete
                            if (i === arr.length - 1 && ind === ar.length - 1) {
                                resolve();
                            }

                            entryCounter++;
                        });
                        
                    }

                    done();

                }

            }]);
        });
    });
}

function prepend() {
    return new Promise ((resolve, reject) => {
        for (let i = 1; i <= sitemapSuffix; i++) {
            fs.appendFileSync(`${sitemapPrefix}${i}.xml`, sitemapFooter);

            if (i === sitemapSuffix) {
                resolve();
            }
        }
    });
}

// append final XML tag to file. this is not working without setTimeout()
// function lastStep() {
//     return new Promise ((resolve, reject) => {
//         setTimeout(() => {
//             fs.appendFileSync(`${sitemapPrefix}.xml`, sitemapFooter);
//             resolve();
//         }, 1000)
//     });
// }

initialize()
    .then(() => initialCrawl())
    .then(() => secondCrawl())
    .then(() => prepend())
    // .then(() => lastStep())
    .then(() => console.log('complete'));