var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
http.createServer(function(request, response){
   pathName = url.parse(request.url).pathname;
   var fp = __dirname+"/../.."+pathName;
   var mime="";
   if(pathName.indexOf("mjs") >=0){
       mime = "text/javascript"
   } else {
       mime = ""
   }
   fs.readFile(fp, function(err, data){
       console.log("request for:", fp)
      if(err){
        response.writeHead(404, {'Content-type':'text/plan'});
        response.write('Page Was Not Found');
        response.end();
       } else {
        response.writeHead(200,{'Content-type':mime});
        response.write(data);
        response.end();
       }
   })
}).listen(3000);
console.log("Server is listening: 3000");