var express = require('express');
var app = express.createServer();
var request = require('request');
var parse = 'http://files.parse.com/';

//Create a static file server
app.configure(function() {
  app.get('/parse/:app/:file', function(req, res) {
    var remoteUrl = parse + req.params.app + '/' + req.params.file;
    request(remoteUrl).pipe(res);
  });
  app.use(express.static(__dirname + '/public'));
});

app.listen(process.env.PORT)

console.log('Express server started on port %s', app.address().port);
