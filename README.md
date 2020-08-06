# SEO Directory Sitemap Generator

This is a Node utility that crawls links in order to generate a sitemap of results pages. Currently configured, the tool expects the following page structure:

**page 1:** links such as `https://www.website.com/people/a/` (letter page)  
**page 2:** links such as `https://www.website.com/people/a/antonio/` (last name page)  
**page 3:** links such as `https://www.website.com/people/jose-antonio/` (result page)  

Instead of crawling the first page, the tool simply generates an array of letters in the alphabet. So we are really just scraping these intermediary pages, populating an array of last names, and then crawling those last name URLs to retrieve URLs to the results pages.

### Other Details

* Naming convention for generated XML files: `icm-ppl-pdnames-sitemap-01.xml`, with an incremented trailing digit.
* The current project requires us to disable pagination on each intermediary page (page 2 referenced above) prior to running the sitemap generator. This can be accomplished by commenting out this line in the PHP callable: `$buckets = array_slice($buckets, ($page * 100 - 100), 100);`. This will ensure that every link previously included on paginated pages will appear on the first page. This implies that we need to make these changes and run the tool in our development environment (not production).
* This relies on a `config.json` file in the root directory formed in the following way:

```json
{
    "devDomain": "http://devdomain",
    "prodDomain": "https://www.productiondomain.com"
}
```