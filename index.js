var Crawler = require("crawler");
let jsdom = require("jsdom");
let fs = require("fs");
const { JSDOM } = jsdom;

const sitemapName = 'sitemap.xml';

const sitemapHeader = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const sitemapFooter = '\n</urlset>';

const wrapStart = `\n<url>
\t<loc>`;
const wrapEnd = `</loc>
</url>`;


if (fs.existsSync(sitemapName)) {
    // if sitemap already exists, delete it
    fs.unlinkSync(sitemapName);
}

let stream = fs.createWriteStream(sitemapName);

stream.write(sitemapHeader);
 
var c = new Crawler();
// const letters = [...'abcdefghijklmnopqrstuvwxyz'];
const letters = [...'abc'];
let lastNameURLS = [];


// crawl letter pages to retrieve last name URLs and add these to an array
let tcgCrawl = new Promise((resolve, reject) => {
    letters.forEach((el, index, array) => {
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
                        // need to visit every page here
                        lastNameURLS.push(`https://www.instantcheckmate.com${el.getAttribute('href')}`);
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


// crawl last name pages and write result page URLs to sitemap
tcgCrawl.then(() => {
    lastNameURLS.forEach((el, index, array) => {
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
        
                    dom.window.document.querySelectorAll(".bc-a").forEach(el => {
                        stream.write(`${wrapStart}https://www.instantcheckmate.com${el.getAttribute('href')}${wrapEnd}`);
                    });
                    
                }
                done();

                if (index === array.length - 1) {
                    stream.write(sitemapFooter);
                }
            }

        }]);
    });
});