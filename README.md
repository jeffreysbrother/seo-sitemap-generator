# SEO Directory Sitemap Generator

This is a Node utility that crawls links in order to generate a sitemap of results pages. Keep in mind it is very project-specific; out of the box, it will not work on some random website.

Currently configured, the tool expects the following page structure:

**page 1:** links such as `https://www.website.com/people/a/` (letter page)  
**page 2:** links such as `https://www.website.com/people/a/antonio/` (last name page)  
**page 3:** links such as `https://www.website.com/people/jose-antonio/` (result page)  

Instead of crawling the first page, the tool simply generates an array of letters in the alphabet. So we are really just scraping these intermediary pages, populating an array of last names, and then crawling those last name URLs to retrieve URLs to the results pages.

### Installation

1. clone this repo
2. run `npm install`
3. create a `config.json` file in the root directory. It must be formed as follows:

```json
{
    "devDomain": "http://devdomain",
    "prodDomain": "https://www.productiondomain.com"
}
```

### Running the Sitemap Generator

1. In your development environment, disable pagination on each intermediary page (page 2 referenced above) _prior_ to running the sitemap generator. This can be accomplished by commenting out this line in the PHP callable: `$buckets = array_slice($buckets, ($page * 100 - 100), 100);`. This will ensure that every link previously included on paginated pages will appear on the first page.
2. run `node index.js` in the root of the project directory.

### Other Details

* Naming convention for generated XML files: `icm-ppl-pdnames-sitemap-01.xml`, with an incremented trailing digit.
* This tool will scrape the pages of a website's dev enironment, but populate a sitemap with its corresponding production URLs.
* All files will be generated in the root of the project directory.
* Currently, we must manually delete all existing sitemap files prior to running the generator. Failure to do this will result in data being appending to existing files.

### Known Issues

* Errors appear to be causing a letter category (e.g. last name starting with "L")--either partially or entirely--to be omitted from the sitemap. Example: `error: CRAWLER Error Error: ESOCKETTIMEDOUT when fetching ${url}`. This might just be a failed response and not an issue with the tool. However, we should look into this in the future.

### Future Features

* Log more detailed info upon completion.
* Handle pagination (instead of requiring that the callable be modified prior to running).