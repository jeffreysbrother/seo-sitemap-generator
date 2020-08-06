# SEO Directory Sitemap Generator

This is a Node utility that crawls links in order to generate a sitemap of results pages. Currently configured, the tool expects the following page structure:

**first page:**  links such as `https://www.website.com/people/a/` (letter page)
**second page:** links such as `https://www.website.com/people/a/antonio/` (last name page)
**third page:**  links such as `https://www.website.com/people/jose-antonio/` (result page)

Instead of crawling the first page, the tool simply generates an array of letters in the alphabet. So we are really just scraping these intermediary pages, populating an array of last names, and then crawling those last name URLs to retrieve URLs to the results pages.