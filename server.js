var fs = require('fs'); 
var https = require('https'); 
var options = { 
     key: fs.readFileSync('certs/server/server-key.pem'), 
    cert: fs.readFileSync('certs/server/server-crt.pem'), 
      ca: fs.readFileSync('certs/root/ca-crt.pem'), 
     crl: fs.readFileSync('certs/root/ca-crl.pem'),
    requestCert: true,
    rejectUnauthorized: true
}; 
var server = https.createServer(options, function (req, res) { 
   var cert = req.socket.getPeerCertificate().subject;
     console.log(new Date()+' '+ 
        req.connection.remoteAddress+' ' +
     req.method+' '+req.url);
   if(cert) {
     console.log(cert.CN);
   }
    res.writeHead(200); 
    res.end("hello world\n"); 
}).listen(8443);

server.on('error', function (e) {
  // Handle your error here
  console.log(e);
});

console.log("running on 8443");
