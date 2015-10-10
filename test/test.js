
var cluster = require('cluster');

cluster.schedulingPolicy = 2;
cluster.setupMaster({
    exec: "aa.js"
});


var net = require('net');


cluster.fork();
cluster.fork();





/*
var server = net.createServer(function (c) { //'connection' listener

});


server.listen( 5000);*/
