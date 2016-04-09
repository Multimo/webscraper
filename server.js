
//TODO: to search through a links in navigationa and construct a list of pages to iterate through
//TODO: hide unwated text on click? in frontend
//TODO: output format to either output.json or send as a responce to app.js
//TODO: Validation on the url sent "http//:"
//TODO: Make requests async / non blocking so more than one request can happen at same time. Promises?
var express = require('express');
var fs = require('fs');
var jsonfile = require('jsonfile');
var request = require('request');
var cheerio = require('cheerio');

var app = express();

var Xray = require('x-ray');  
var xray = new Xray();

var bodyParser = require('body-parser');
var router = express.Router();


// needed middleware for accepting post json objected from index.html
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());


// middle ware to solve the access-controll-allow-origin issue with the api
app.use(function(req, res, next) { 
    res.header('Access-Control-Allow-Origin', "*"); 
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE'); 
    res.header('Access-Control-Allow-Headers', 'Content-Type'); 
    next();
});
    
// makes /client the root of the routes       
app.use(express.static('client'));

// all calls to server will pass through this function and the middle ware above
router.use(function(req, res, next) {
    console.log("Something is happening");
    next();
});
//basic get request. used for testing
router.get('/', function(req, res) {
    console.log('working?')
    res.json({
        message: 'hooray! welcome to our api!'
    });
   
});
//default post route, returns a single pages content
router.post("/", function(req, res, next) {
    //catpure and log the url in the request
    var url = req.body.url;
    console.log(req.body);
    var outPut;
 


    //begin request to url
    request({
        url: url,
        headers: {
             'User-Agent': 'tim.mulqueen@gmail.com',
        }

    }, function(error, response, html) {

        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(html, {
                ignoreWhitespace: true
            });
            
            // this takes all tags from within the body tag except scripts returns all the text
            // and then cleans it up into a nice array ["Home", "About", "Services", etc.]
            outPut = $('body *')
            .not($("script"))
            .not($("style"))
            .contents()
            .map(function() {
                 return (this.type === 'text') ? $(this).text() : ' ';
            })
            .get()
            .reduce(function(all, item, index) {
              if ( item != ' ' && item != "' '" ) {
               all.push(item);
              }
              return all;
             }, []);
             
             res.send(outPut);
            
         ;
           
           
            //  console.log( JSON.stringify(outPut, null, 2));
          
            // var string = outPut.map(function() {
            //   return this.replace( 'Montreal', '%WORKCITY%' );
            //  });

            
            

        } else res.send("hello something went wrong! Error: %s", error);

        // writes file to output.json needs content to be stringified


    })
});
// links api route returns links
router.post("/links", function(req, res, next){
    //puts url in a var and logs it
    var linkUrl = req.body.url;
    var id = req.body.$id

    var linkOutPut;
    
    //transform string of url into a regex
    var urlRegex = new RegExp(linkUrl);
    var invalidEntries = 0;
    //need two transformer on the results
    // 1: to filter links based on url sent in filter out /# and any without url
    // 2: filter out any \t \n from results .replace .trim
    // 3: filter out any text nodes in a link
    function filterLinks(obj) {
      if ( obj.a && obj.href.search(urlRegex) != -1 ) {
        obj.a.trim();
        return true;
      } else {
        invalidEntries++;
        return false;
      }
    }
    
    
    //needs to go to each link in a page and if the link shares characters with the url var
    // it should return an object of the links
    console.log('hitting the xray with %s', linkUrl);
    linkOutPut = xray( linkUrl, 'a', [
     {
      a: '',
      href: '@href' 
    }])(function(err, results) {
        if (!err) {
            var data = results.filter(filterLinks);
            console.log('there were %s entrieds filtered', invalidEntries);
           
            res.send(data);
        } else console.log('erroer: %s', err);
    })
    
    

});
// sets /client to router as  above
app.use('/client', router);

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;