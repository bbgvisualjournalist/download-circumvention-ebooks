var async = require("async");
var jsdom = require("jsdom");
var request = require("request");
var cheerio = require('cheerio');

var fs = require("fs");
var url = require("url");

var webshot = require('webshot');

//base domain
//var domain = "http://visualjournali.st";
//var domain = "http://184.73.203.85:8080"
var domain = "http://localhost:3000"
var books = [];


request(domain, function (error, response, html) {
	if (!error && response.statusCode == 200) {
		var $ = cheerio.load(html);

		$('ul').each(function(n, element){
			var bookFolder = $(this).attr('id');
			var imageFolder = bookFolder + "/images"
			var stylesheetsFolder = bookFolder + "/stylesheets"
			var fontsFolder = bookFolder + "/fonts"
			var metaFolder = bookFolder + "/META-INF"

			//Create book folder and subdirectories for /images, stylesheets etc ========================================
			if (!fs.existsSync(bookFolder)) fs.mkdirSync(bookFolder);
			if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
			if (!fs.existsSync(stylesheetsFolder)) fs.mkdirSync(stylesheetsFolder);
			if (!fs.existsSync(fontsFolder)) fs.mkdirSync(fontsFolder);
			if (!fs.existsSync(metaFolder)) fs.mkdirSync(metaFolder);

			//Add bookfolder to an array so that you can add files to it.
			books.push(bookFolder);
		});
		console.log("books");
		console.log(books);


		/*
		//optional function for splitting the filename off of a url
		function getFileName(path) {
				return path.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)(:([^\/]*))?((\/[\w/-]+)*\/)([\w\-\.]+[^#?\s]+)(\?([^#]*))?(#(.*))?$/i)[8];
		}
		*/


		//ADD STYLESHEETS================================================================================
		console.log(' ')
		var files_array = ['stylesheet.css', 'page_styles.css'];

		var download = function(uri, filename, callback){
			request.head(uri, function(err, res, body){
				var r = request(uri).pipe(fs.createWriteStream(filename));
				r.on('close', callback);
			});
		};



		var counter = 0;
		var fileNumber = 0;

		function loop(){
			if (counter<books.length&&fileNumber<files_array.length){
				var source=domain + '/stylesheets/' + files_array[fileNumber];
				var output=books[counter] + '/stylesheets/' + files_array[fileNumber];
				console.log('Saving ' + files_array[fileNumber] +' files in '+ books[counter]);
				download(source, output, function(){loop();});

				counter++;
			} else if (fileNumber<files_array.length){
				counter=0;
				fileNumber++;
				loop();
			} else{
				console.log(' ')
			}
		}
		loop();





		//Generalizing a function for downloading files.
		function callLoop(arrayInput, folderInput, addExtension, prefixFolder){
			var loop_array = arrayInput;
			var folder = folderInput;//optional variable for subdirectories e.g. 'fonts/'

			var book = 0;
			var fileNumber = 0;
			var inputFolder = '';

			function looper(){
				if (prefixFolder){
						folder = '';
						inputFolder = books[book] +'/';
						console.log('-----------FOLDER: '+folder);
				}
				if (book<books.length&&fileNumber<loop_array.length){
					var source=domain + '/' + inputFolder + folder + loop_array[fileNumber] + "?mode=export";
					console.log('Downloading: '+ loop_array[fileNumber])
					console.log('From: '+ source);
					console.log(' ')
					var output=books[book]+'/'+folder+loop_array[fileNumber]+addExtension;
					//console.log('Saving ' + loop_array[fileNumber] +' in ' + books[book] + folder);
					download(source, output, function(){looper();});

					book++;
				} else if (fileNumber<loop_array.length){
					book=0;
					fileNumber++;
					looper();
				} else{
					console.log('Done.')
				}
			}
			looper();
		}
		//var fonts_array = ['AdobeFanHeitiStd-Bold.otf', 'AdobeHeitiStd-Regular.otf','ヒラギノ明朝ProW3.otf', 'ヒラギノ明朝ProW6.otf'];
		var fonts_array = ['AmaticSC-Regular.otf', 'Oswald-Regular.otf', 'RobotoSlab-Bold.otf'];
		callLoop(fonts_array, 'fonts/', "", false);

		

		var mainFiles_array = ['content.opf', 'cover.xhtml', 'introduction.xhtml', 'titlepage.xhtml', 'toc.xhtml', 'toc.ncx'];
		callLoop(mainFiles_array, '', "", true);



		var toolFiles_array = ['dns', 'freegate', 'pgp', 'psiphon', 'tor', 'ultrasurf', 'vpn'];
		callLoop(toolFiles_array, '', ".xhtml", true);



		var meta_array = ['container.xml'];
		callLoop(meta_array, 'META-INF/', '', false);



		var images_array = ['circumvention.png', 'comic_PGP_6.png', 'icons_bottomLine.png', 'icons_caution.png', 'icons_help_alt.png', 'icons_how.png', 'icons_trap.png', 'icon_anonymity.png', 'icon_check.png', 'icon_checkHover.png', 'icon_circumvention.png', 'icon_encryption.png', 'icon_portability.png'];
		callLoop(images_array, 'images/', "", false);



		//Manually creating mimetype file (instead of scraping) because scraping added a \n that broke validation.
		function addMime(){
			for (var s=0; s<books.length;s++){
				var targetMime = books[s] +'/mimetype'
				fs.writeFile(targetMime, "application/epub+zip", function(err) {
					if(err) {
						return console.log(err);
					}
				});
			}
		}
		addMime();








		//LOADING COMICS====================================================
		var options = {
		  screenSize: {
		    width: 950
		  , height: 480
		  }
		, defaultWhiteBackground: true
		, shotOffset: { left: 20
			, right: 35
			, top: 10
			, bottom: 50 
		}, shotSize: {
		    width: 950
		  , height: 'all'
		  }
		}

		var comics_array = ['dns', 'freegate', 'pgp', 'psiphon', 'tor', 'ultrasurf', 'vpn'];
		var counterComics = 0;
		var currentLanguage = 0;
		var language = 'english';

		function loopComics(){
			//var language = 'english';
			if (currentLanguage<books.length){
				language = books[currentLanguage];

				if(counterComics<comics_array.length){
					var imageInput = domain + '/comics/' + language + '/' + comics_array[counterComics];
					var imageOutput = language + '/images/' + comics_array[counterComics] + '.png';

					webshot(imageInput, imageOutput, options, function(err) {
						// screenshot now saved to .jpeg or png
						console.log(err);
						console.log("downloaded " + imageOutput);
						counterComics++;
						loopComics();
					});
				}else{
					console.log('done with current language.')
					currentLanguage++;
					counterComics = 0;
					loopComics();
				}
			}
		}
		//loopComics();



		var optionsCover = {
		  screenSize: {
		    width: 600
		  , height: 800
		  }
		, shotOffset: { left: 20
			, right: 0
			, top: 0
			, bottom: 0 
		}, shotSize: {
		    width: 600
		  , height: 800
		  }
		}
		var currentLanguageCover = 0;
		var languageCover = 'english';

		function loopCover(){
			if(currentLanguageCover<books.length){
				language = books[currentLanguageCover];
				var coverInput = domain + '/' + language + '/coverExport.xhtml';
				var coverOutput = language + '/images/cover.png';

				webshot(coverInput, coverOutput, optionsCover, function(err) {
					// screenshot now saved to .jpeg or png
					console.log(err);
					console.log("downloading " + coverInput);
					console.log("downloaded " + coverOutput);
					currentLanguageCover++;
					loopCover();
				});
			}
		}
		loopCover()




/*


		//LOADING PHOTOS BASED ON THE SPREADSHEET================================================================================

		var Tabletop = require('tabletop');
		var testURL = 'https://docs.google.com/spreadsheets/d/1dXbUkXlGb8GyVMdKpuJB__82MAI6-VWqhzcvq2A3rYY/pubhtml';

		var myData;
		function onLoad(data, tabletop) {
			console.log("loading spreadsheet");
			myData = data.photos.elements;
			console.log(myData);
			loopPhotos();
		};

		var options = {
			key: testURL,
			callback: onLoad
		};

		Tabletop.init(options);


		var currentBook = 0;
		var photo_number = 0;

		function loopPhotos(){
			if (currentBook < books.length && photo_number<myData.length){

				if(currentBook + 1 == myData[photo_number].book){
					var source=domain + '/images/' + myData[photo_number].filename;
					var output=books[currentBook] + '/images/' + myData[photo_number].filename;

					download(source, output, function(){
						console.log('Saving ' + myData[photo_number].filename + ' files in '+ books[currentBook]);
						photo_number++
						loopPhotos();
					});
				} else{
					currentBook++;
					loopPhotos();
				}
			}else{
				console.log('Done saving photos')
			}
		}*/

	}
});
