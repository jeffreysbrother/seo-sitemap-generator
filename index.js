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
                        // need to visit every page here
                        stream.write(`${wrapStart}https://www.truthfinder.com${el.getAttribute('href')}${wrapEnd}`);
                    });
                    
                }
                done();

                if (index === array.length - 1) {
                    stream.write(sitemapFooter);
                    resolve();
                }
            }

        }]);
    });
});

tcgCrawl.then(() => {
    console.log(results);
});