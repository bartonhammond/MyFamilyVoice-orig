var express = require('express');
var app = express.createServer();
var request = require('request');
var parse = 'http://files.parse.com/';
var config = require('./config.js');
var simpleRecaptcha = require('simple-recaptcha');

//Create a static file server
app.configure(function() {
  app.use(express.bodyParser());

  app.get('/parse/:app/:file', function(req, res) {
    var remoteUrl = parse + req.params.app + '/' + req.params.file;
    request(remoteUrl).pipe(res);
  });

  app.post('/recaptcha', function(req, res) {
    var ip = req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    
    simpleRecaptcha(config.accounts.recaptcha,
                    ip,
                    req.param('recaptcha_challenge_field'),
                    req.param('recaptcha_response_field'),
                    function(err) {
                      console.log(err);
                      if (err) {
                        res.status(401).send(err);
                      } else {
                        res.send('ok');
                      }
                    });
  });

  app.use(express.static(__dirname + '/public'));

});

app.listen(process.env.PORT)

console.log('Express server started on port %s', app.address().port);
