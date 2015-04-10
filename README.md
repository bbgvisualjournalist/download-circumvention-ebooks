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

##Validating and compressing your ebooks
After downloading all of the files, you'll still want to validate the epub with epubcheck (3.0.1). This is an excellent tool for identifying any errors, warnings or omissions. From the command line: 
```java -jar epubcheck-3.0.1.jar /the-path-to-your-downloaded-/ebook -mode exp -v 3.0 -out errors.xml```
This will save an errors.xml file with a list of the warnings and errors.

After your book passes inspection, you'll need to zip it up as an epub. The .epub format requires that the files be saved in a particular order. I recommend using [ePub Zip/Unzip 2.0.1](https://code.google.com/p/epub-applescripts/downloads/detail?name=ePub%20Zip%20Unzip%202.0.1.app.zip&can=2&q=). Just drag the folder you want to convert to an epub onto the icon.
