let Crawler = require("crawler");
let jsdom = require("jsdom");
let fs = require("fs");
let { JSDOM } = jsdom;

const config        = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const devDomain     = config.devDomain;
const prodDomain    = config.prodDomain;

// remove everything after "T"
// example without replace(): 2020-08-07T21:33:03.899Z
const date = new Date().toISOString().replace(/\T.*/,'');

const sitemapPrefix = 'icm-ppl-pdnames-sitemap-';
let sitemapSuffix   = 1;

const sitemapHeader = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const sitemapFooter = '\n</urlset>';
const wrapStart     = '\n\t<url>\n\t\t';
const wrapEnd       = '\n\t</url>';
const lastMod       = `\n\t\t<lastmod>${date}</lastmod>`;

const letters       = [...'abcdefghijklmnopqrstuvwxyz'];
let lastNameURLS    = [];
let entryCounter    = 0;
const maxEntries    = 50000;


let c = new Crawler();


// crawl letter pages to retrieve last name URLs and add these to an array
function letterCrawl() {
    return new Promise((resolve, reject) => {
        const letterCrawler = new Crawler({
            jQuery: false,
        
            callback: function (error, res, done) {
        
                if (error) {
                    console.log(error);
                } else {
        
                    let dom = new JSDOM(res.body);
        
                    dom.window.document.querySelectorAll(".bc-a").forEach(path => {
                        lastNameURLS.push(`${prodDomain}${path.getAttribute('href')}`);
                    });
                    
                }
                done();
            }
        });

        console.log('Crawl started...');

        letterCrawler.queue(letters.map(letter => `${devDomain}/people/${letter}/`));
        letterCrawler.on('drain', resolve);
    });
}


// crawl last name pages and write result page URLs to sitemap
function lastNameCrawl() {
    return new Promise ((resolve, reject) => {
        const lastNameCrawler = new Crawler({
            jQuery: false,
        
            callback: function (error, res, done) {
        
                if (error) {
                    console.log(error);
                } else {
        
                    let dom = new JSDOM(res.body);
        
                    dom.window.document.querySelectorAll(".bc-a").forEach((path, ind, ar) => {

                        let targetFile = `${sitemapPrefix}${sitemapSuffix.toString().padStart(2, '0')}.xml`;

                        // write sitemapHeader to file
                        if (entryCounter === 0) {
                            fs.appendFileSync(targetFile, sitemapHeader);
                        }

                        // write URL to file (along with some XML tags)
                        fs.appendFileSync(targetFile, `${wrapStart}<loc>${prodDomain}${path.getAttribute('href')}</loc>${lastMod}${wrapEnd}`);

                        entryCounter++;

                        // write sitemapFooter to file when maximum number of entires has been reached
                        if (entryCounter >= maxEntries) {
                            fs.appendFileSync(targetFile, sitemapFooter);
                        }

                        // reset counter, increment suffix
                        if (entryCounter === maxEntries) {
                            entryCounter = 0;
                            sitemapSuffix++;
                        }

                    });
                    
                }
                done();
            }
        });

        lastNameCrawler.queue(lastNameURLS.map(url => `${url}`));
        lastNameCrawler.on('drain', function () {
            // write sitemapFooter to file on last document
            fs.appendFileSync(`${sitemapPrefix}${sitemapSuffix.toString().padStart(2, '0')}.xml`, sitemapFooter);
            resolve();
        });
    });
}

letterCrawl()
    .then(() => lastNameCrawl())
    .then(() => console.log(`Complete! ${sitemapSuffix} file${sitemapSuffix > 1 ? 's' : ''} created.`));