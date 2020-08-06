var Crawler = require("crawler");
let jsdom = require("jsdom");
let fs = require("fs");
const { JSDOM } = jsdom;

// TODO 
// last xml tag only working some of the time
// doesn't generate the same number of files every time (could this be due to maxConnections and rateLimit? see docs)
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
const maxEntries    = 5000;


let c = new Crawler();


// crawl letter pages to retrieve last name URLs and add these to an array
function initialCrawl() {
    return new Promise((resolve, reject) => {
        console.log('Crawl started...');
        letters.forEach((letter, index, array) => {
            c.queue([{
                uri: `https://www.instantcheckmate.com/people/${letter}/`,
                jQuery: false,
            
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
            
                callback: function (error, res, done) {
            
                    if (error) {
                        console.log(error);
                    } else {
            
                        let dom = new JSDOM(res.body);
            
                        dom.window.document.querySelectorAll(".bc-a").forEach((path, ind, ar) => {

                            // write sitemapHeader to file
                            if (entryCounter === 0) {
                                fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix.toString().padStart(2, '0')}.xml`, sitemapHeader);
                            }

                            // write URL to file
                            fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix.toString().padStart(2, '0')}.xml`, `${wrapStart}https://www.instantcheckmate.com${path.getAttribute('href')}${wrapEnd}`);

                            entryCounter++;

                            // write sitemapFooter to file
                            if (entryCounter === maxEntries || (ind === ar.length - 1 && i === arr.length - 1)) {
                                fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix.toString().padStart(2, '0')}.xml`, sitemapFooter);
                            }

                            // reset counter, increment suffix
                            if (entryCounter === maxEntries) {
                                entryCounter = 0;
                                sitemapSuffix++;
                            }

                            // resolve promise when forEach iteration is complete
                            if (i === arr.length - 1 && ind === ar.length - 1) {
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

initialCrawl()
    .then(() => secondCrawl())
    .then(() => console.log(`Complete! ${sitemapSuffix} files created.`));