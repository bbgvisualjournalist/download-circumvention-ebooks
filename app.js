var async = require("async");
var jsdom = require("jsdom");
var request = require("request");
var cheerio = require('cheerio');
var fs = require("fs");
var url = require("url");
var webshot = require('webshot');

//base domain
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
		console.log("Creating these books:");
		console.log(books);



		//Download epub files================================================================================

		var download = function(uri, filename, callback){
			request.head(uri, function(err, res, body){
				var r = request(uri).pipe(fs.createWriteStream(filename));
				r.on('close', callback);
			});
		};






		//Generalized function for downloading files.
		function callLoop(arrayInput, folderInput, addExtension, prefixFolder){
			var loop_array = arrayInput;
			var folder = folderInput;//optional variable for subdirectories e.g. 'fonts/'

			var book = 0;
			var fileNumber = 0;
			var inputFolder = '';

			function looper(){
				if (prefixFolder){
						folder = '';
						inputFolder = books[book] + '/';
				}
				if (book<books.length&&fileNumber<loop_array.length){
					var source=domain + '/' + inputFolder + folder + loop_array[fileNumber] + "?mode=export";
					var output=books[book] + '/' + folder + loop_array[fileNumber] + addExtension;

					console.log('Downloading: '+ loop_array[fileNumber])
					console.log('From: '+ source);
					console.log(' ')

					download(source, output, function(){looper();});

					book++;
				} else if (fileNumber<loop_array.length){
					book=0;
					fileNumber++;
					looper();
				} else{
					console.log('Finished loop.')
				}
			}
			looper();
		}
		//var fonts_array = ['AdobeFanHeitiStd-Bold.otf', 'AdobeHeitiStd-Regular.otf','ヒラギノ明朝ProW3.otf', 'ヒラギノ明朝ProW6.otf'];
		var fonts_array = ['AmaticSC-Regular.otf', 'Oswald-Regular.otf', 'RobotoSlab-Bold.otf'];
		callLoop(fonts_array, 'fonts/', "", false);


		var stylesheets_array = ['stylesheet.css', 'page_styles.css'];
		callLoop(stylesheets_array, 'stylesheets/', "", false);



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
				var targetMime = books[s] + '/mimetype'
				fs.writeFile(targetMime, "application/epub+zip", function(err) {
					if(err) {
						return console.log(err);
					}
				});
			}
		}
		addMime();








		//Create .png screenshots of comics in language====================================================
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

		var comics_array = toolFiles_array;
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
					console.log('Done downloading ' + language + ' comics.')
					currentLanguage++;
					counterComics = 0;
					loopComics();
				}
			}
		}
		loopComics();



		//Create .png screenshots of covers with titles in language.====================================================
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
		loopCover();

	}
});
