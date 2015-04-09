# Downloading the circumvention ebooks
A simple, single-purpose Node app for downloading, scraping and collecting all of the assets needed to export ePub versions of [VOA's Circumventing Censorship project](projects.voanews.com/circumvention/) in different languages. 

##How it works
After you set up a server for [the content](https://github.com/bbgvisualjournalist/circumventing-censorship), this application will enable you to download:
* The fonts (as defined in the fonts_array)
* Stylesheets (stylesheets_array)
* The images (images_array)
* The required epub meta-inf and mimetype files.
* The main XHTML contents of the ebooks (mainFiles_array)
* The circumvention tool chapters (toolFiles_array)

It will also take a screenshot of the comic book explanation for each tool and book cover in the corresponding language and download a .png file.

##Running the application
1. Download the package. 
2. Run ```npm install``` to install the dependencies.
3. Run ```node app.js```
