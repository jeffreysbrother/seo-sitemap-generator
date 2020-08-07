let Crawler = require("crawler");
let jsdom = require("jsdom");
let fs = require("fs");
let { JSDOM } = jsdom;

const config        = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const devDomain     = config.devDomain;
const prodDomain    = config.prodDomain;

const sitemapPrefix = 'icm-ppl-pdnames-sitemap-';
let sitemapSuffix   = 1;

const sitemapHeader = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const sitemapFooter = '\n</urlset>';
const wrapStart     = '\n\t<url>\n\t\t<loc>';
const wrapEnd       = '</loc>\n\t</url>';

const letters       = [...'abcdefghijklmnopqrstuvwxyz'];
// const letters       = [...'abcd'];
let lastNameURLS    = [];
let entryCounter    = 0;
const maxEntries    = 50000;


let c = new Crawler();


// crawl letter pages to retrieve last name URLs and add these to an array
function initialCrawl() {
    return new Promise((resolve, reject) => {
        console.log('Crawl started...');
        letters.forEach((letter, index, array) => {
            c.queue([{
                uri: `${devDomain}/people/${letter}/`,
                jQuery: false,
                rateLimit: 2000,
            
                callback: function (error, res, done) {
            
                    if (error) {
                        console.log(error);
                    } else {
            
                        let dom = new JSDOM(res.body);
            
                        dom.window.document.querySelectorAll(".bc-a").forEach((path, ind, arr) => {
                            lastNameURLS.push(`${prodDomain}${path.getAttribute('href')}`);

                            // resolve promise when both forEach iterations are complete
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
                            fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix.toString().padStart(2, '0')}.xml`, `${wrapStart}${prodDomain}${path.getAttribute('href')}${wrapEnd}`);

                            entryCounter++;

                            // write sitemapFooter to file
                            if (entryCounter >= maxEntries || (ind === ar.length - 1 && i === arr.length - 1)) {
                                fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix.toString().padStart(2, '0')}.xml`, sitemapFooter);
                            }

                            // reset counter, increment suffix
                            if (entryCounter === maxEntries) {
                                entryCounter = 0;
                                sitemapSuffix++;
                            }

                            // resolve promise when both forEach iterations are complete
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