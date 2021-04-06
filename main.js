var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
path = require("path");
var os = require('os');
var port = process.argv[2];
var zlib = require('zlib');
var portfinder = require('portfinder');

var certOptions = {
    // key: fs.readFileSync(__dirname+"/../.." + '/ssl/server.key'),
    // cert: fs.readFileSync(__dirname+"/../.." + '/ssl/server.crt')
}

mimetypes = {
    "css" : "text/css",
    "html": "text/html",
    "ico" : "image/ico",
    "jpg" : "image/jpeg",
    "js"  : "text/javascript",
    "json": "application/json",
    "png" : "image/png",
    "mjs" : "text/javascript"
};
/*
http.createServer(certOptions,function(request, response){
  var pathName= url.parse(request.url).pathname;
  if (pathName == "" || pathName == "/") {
    request.url = "/index.html";
  }

  pathName = url.parse(request.url).pathname;
  var fp = __dirname+"/../.."+pathName;
  


  var readStream = fs.createReadStream(fp);
  readStream.on('open', function (res) {
    response.writeHead(200, { 'content-encoding': 'gzip' });
    readStream.pipe(zlib.createGzip()).pipe(response);
  });

  readStream.on('error', function(err) {
    response.writeHead(404, {'Content-type':'text/plan'});
    response.write('Page Was Not Found');
    response.end();
  });
}).listen(port);
*/

portfinder.getPort(function (err, port) {
  if(port){
        //  WITHOUT GZIP
    http.createServer(certOptions,function(request, response){
      var filePath = '.' + request.url;
          

      console.log("filePath",filePath)
      if (filePath == './') {
          filePath = './index.html';
      }
      if(!path.extname(filePath)){
        filePath += '/index.html';
      }
      filePath=path.resolve(filePath);
      filePath = filePath.split("?")[0]

      if (!fs.existsSync(filePath)) {
        if(filePath.includes("ld.json")){
          response.writeHead(302, {//temporarily use /docs/topics/ld.json
            'Content-type':'text/plain',
            'Location': '/resources/docs/topics/ld.json'
          });
        }
        else if(filePath.includes("resources")){
          response.writeHead(301, {
            'Content-type':'text/html',
            'Location': '/resources/index.html'
          });
        }
        else{
          response.writeHead(301, {
            'Content-type':'text/html',
            'Location': '/'
          });
        }
        // response.write('Page Was Not Found');
        response.end();
        // fs.readFile("./index.html", function(err, data){
        //   response.writeHead(200, {'Content-Type':"text/html"});
        //   response.write(data);
        //   response.end();
        // })
        return;
      }

      var readStream = fs.createReadStream(filePath);
        readStream.on('open', function (res) {
          var mType = mimetypes[path.extname(filePath).split(".")[1]];
          response.writeHead(200, { 
            'content-encoding': 'gzip', 
            'Content-Type':mType||'application/octet-stream' 
          });
          readStream.pipe(zlib.createGzip()).pipe(response);
        });

        readStream.on('error', function(err) {
          if(filePath.includes("resources")){
            response.writeHead(301, {
              'Content-type':'text/html',
              'Location': '/resources/index.html' + request.querystring
            });
          }
          else {
            response.writeHead(404, {'Content-type':'text/plan'});
            response.write('Resource Not Found: ' + filePath);
          }
          response.end();
        });
      /*fs.readFile(filePath, function(err, data){
        if(err){
          console.log("Not Found:", request.url);
          response.writeHead(302, {
            'Content-type':'text/html',
            'Location': '/index.html'
          });
          // response.write('Page Was Not Found');
          response.end();
        } else {
          var mType = mimetypes[path.extname(filePath).split(".")[1]];
          response.writeHead(200, {'Content-Type':mType||'application/octet-stream'});
          response.write(data);
          response.end();
        }
      })*/
    }).listen(process.env.PORT||port);


    console.log("Server Running, Port: " + port);

    try{//log IPv4 address, can be accessed from phone/tablet for testing only.
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }


    if(addresses && addresses.length > 0){
      console.log("\x1b[32m%s\x1b[0m", "IPv4: \t\thttp://" + addresses[0] + ":" + port + "/");
    }
    } catch(e){}

    console.log("\x1b[32m%s\x1b[0m", "Localhost: \thttp://localhost:" + port + "/");

    // console.log("__dirname",path("../../"+__dirname))

  }
  else {
    console.log(err)
  }
});

