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

app.get("/state/:id", function(req,res) {
   http.get({
	hostname: 'localhost',
	port: 3000,
	path: "/state/" + req.params.id
	}, function(httpres)  {
   read_http(httpres, function(d) {
     res.send(d);
   });
})
});

function read_http(res, cb) {
  var data = "";
        res.on('data', function(d) {
data = data + d.toString();
        });
        res.on('end', function() {
  cb(data);
        });
}

app.get("/test/:id/:cmd", function(req,res) {
     console.log(new Date()+' '+ 
        req.connection.remoteAddress+' ' +
     req.method+' '+req.url);
   if(req.socket.getPeerCertificate) {
   var cert = req.socket.getPeerCertificate().subject;
   if(cert) {
     console.log('Certificate: ' + JSON.stringify(cert));
   }
}
   http.get({
	hostname: 'localhost',
	port: 3000,
	path: "/test/" + req.params.id + "/" + req.params.cmd,
	}, function(httpres)  {
           read_http(httpres,function(done) {
         res.send(done);
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

http.createServer(app).listen(8000);
console.log("internal on 8000");
