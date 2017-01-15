var fs = require('fs'); 
var https = require('https'); 
var http = require('http'); 
var express = require('express');

var options = { 
     key: fs.readFileSync('certs/server/server-key.pem'), 
    cert: fs.readFileSync('certs/server/server-crt.pem'), 
      ca: fs.readFileSync('certs/root/ca-crt.pem'), 
     crl: fs.readFileSync('certs/root/ca-crl.pem'),
    requestCert: true,
    rejectUnauthorized: true
}; 

var app = express();

app.use(express.static("public"));

app.get("/test/:id/:cmd", function(req,res) {
   var cert = req.socket.getPeerCertificate().subject;
     console.log(new Date()+' '+ 
        req.connection.remoteAddress+' ' +
     req.method+' '+req.url);
   if(cert) {
     console.log('Certificate: ' + JSON.stringify(cert));
   }
   http.get({
	hostname: 'localhost',
	port: 3000,
	path: "/test/" + req.params.id + "/" + req.params.cmd,
	}, function(httpres)  {
        httpres.on('data', function(d) {
        });
        httpres.on('end', function() {
         res.send("DONE");
         console.log("Finished");
        });
   });
});

var server = https.createServer(options, app);

server.on('error', function (e) {
  // Handle your error here
  console.log(e);
});

server.listen(8443);
console.log("running on 8443");
