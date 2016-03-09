(function() {
  'use strict';

  app.factory('FetchFileFactory', ['$http',
    function($http) {
      var _factory = {};

      _factory.fetchFile = function(file) {
                                     var filetype=file.split('.').pop();
                                   if(filetype=="png" ||filetype=="pdf"||filetype=="doc"||filetype=="docx"||filetype=="xlsx"||filetype=="xls"||filetype=="jpg"||filetype=="jpeg")
                                   {
                                   return file;
                                   }
        return $http.get('/api/resource?resource=' +file);
                                   
      };

      return _factory;
    }
  ]);

}());
