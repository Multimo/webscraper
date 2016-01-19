
(function(){
	var app = angular.module("app", []); //sets it to be first run on html tag

app.controller("UrlController", function($http, $scope){
        
        // console.log("its working?");
        
        $scope.findUrl = function (url){
            var data = {url};
            console.log(data);
          $http.post("https://web-scraper-multimo.c9.io:8081/client", data)
          .then(function(response) {
             console.log(response);
             return $scope.outPut = response;
          });
          
        }
    
});

})();


