
//TODO: to search through a links in navigationa and construct a list of pages to iterate through

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
var x = Xray();

var bodyParser = require('body-parser');
var router = express.Router();


// needed middleware for accepting post json objected from index.html
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());


// makes /client the root of the routes       
app.use(express.static('client'));

// all calls to server will pass through this function and the middle ware above
router.use(function(req, res, next) {
    console.log("Something is happening");

    next();
});

router.get('/', function(req, res) {
    console.log('working?')
    res.json({
        message: 'hooray! welcome to our api!'
    });
   
});

router.post("/", function(req, res, next) {
    
    var url = req.body.url;
    console.log(url);
    var outPut;
    
    links = x(url, 'a', [{
  title: '',
  href: '@href',
  }])(function(err, a) {
               res.send(links); 
           });
    


    
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
            // where to store text from site
            // var json = [];
            // var testoutPut = $("script").contents().filter(function(){
            //     return (this.name === 'script');
            // })
                
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
          
            
            // links = $('a')
            // .reduce(fucntion(all, item, index) {
                
            // });
            // console.log(links);
            
        //     x($, 'title')(function(err, title) {
        //       console.log(title); 
        //   });
           
           
            //  console.log( JSON.stringify(outPut, null, 2));
          



             jsonfile.writeFile('output.json', outPut, function(error) {
            if (error) {
                console.log("write error:  " + error.message);
            } else {
                console.log('File successfully written! - Check your project directory for the output.json file');
            }
            res.send(outPut);
           
        })

        } else res.send("hello! something went wrong!" + error);

        // writes file to output.json needs content to be stringified


    })
});




// sets /client to router as  above
app.use('/client', router);

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;