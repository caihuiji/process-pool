
/*
var zmq = require("zmq");

var zmqClient = zmq.socket('sub');
zmqClient.connect("tcp://127.0.0.1:10000");
zmqClient.subscribe("");

setTimeout(function (){
    zmqClient.close()
},5000)
*/


var http = require('http');

var server = http.createServer(function (req, res) {
   while(true){console.log(111)}
});


server.listen( 5000);

