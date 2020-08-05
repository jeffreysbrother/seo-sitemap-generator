var Crawler = require("crawler");
let jsdom = require("jsdom");
let fs = require("fs");
const { JSDOM } = jsdom;

// TODO 
// please wait
// formatting
// multiple sitemaps
// log stuff on completion
//    * # of sitemaps created
//    * sitemap name, # of entries for each

const sitemapPrefix = 'icm-ppl-pdnames-sitemap-';
const xmlFile       = `${sitemapPrefix}.xml`;

const sitemapHeader = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const sitemapFooter = '\n</urlset>';
const wrapStart     = '\n\t<url>\n\t\t<loc>';
const wrapEnd       = '</loc>\n\t</url>';

// const letters       = [...'abcdefghijklmnopqrstuvwxyz'];
const letters       = [...'ab'];
let lastNameURLS    = [];

let c = new Crawler();

function initialize() {
    return new Promise((resolve, reject) => {
        // if sitemap already exists, delete it.
        if (fs.existsSync(xmlFile)) {
            fs.unlinkSync(xmlFile);
        }

        // create empty file
        fs.openSync(xmlFile, 'w');

        fs.appendFile(xmlFile, sitemapHeader, function () {
            resolve();
        });

    });
}


// crawl letter pages to retrieve last name URLs and add these to an array
function initialCrawl() {
    return new Promise((resolve, reject) => {
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
            
                        dom.window.document.querySelectorAll(".bc-a").forEach(path => {
                            lastNameURLS.push(`https://www.instantcheckmate.com${path.getAttribute('href')}`);
                        });
                        
                    }

                    done();

                    // resolve promise when forEach iteration is complete
                    if (index === array.length - 1) {
                        resolve();
                    }
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
                            fs.appendFileSync(xmlFile, `${wrapStart}https://www.instantcheckmate.com${path.getAttribute('href')}${wrapEnd}`);
                        });
                        
                    }

                    done();

                    // resolve promise when forEach iteration is complete
                    if (i === arr.length - 1) {
                        resolve();
                    }

                }

            }]);
        });
    });
}

function lastStep() {
    return new Promise ((resolve, reject) => {
        fs.appendFileSync(xmlFile, sitemapFooter);
        resolve();
    });
}

initialize()
    .then(() => initialCrawl())
    .then(() => secondCrawl())
    .then(() => lastStep())  // append final XML tag to file. this is not working
    .then(() => console.log('complete'));