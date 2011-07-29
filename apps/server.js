#!/usr/local/bin/node

var router = require('./lib/node-router/lib/node-router');
var http = require('http');
var url = require('url');
var sys = require('sys');
var bus = require('./lib/node-bus/bus.server');

var dirHandler = router.staticDirHandler("static/", "", ["index.html"]);
var httpServer = http.createServer();
var busServer = new bus.BusServer(httpServer);

httpServer.addListener('request', function (req, res) {
    if(req.method === "GET" && !NODEBUS_PATTERN.test(req.url)) {
        return dirHandler(req, res);
    }
});

busServer.addListener('receive', function(clientId, obj) {
    sys.puts('receive: ' + obj);
});

busServer.addListener('receiveInvalidMessage', function(clientId, obj) {
    sys.puts('receive invalid message: ' + obj);
});

busServer.addListener('receiveInvalidJSON', function(obj) {
    sys.puts('receive invalid JSON: ' + obj);
});

busServer.addListener('listen', function(clientId, eventName) {
    sys.puts('listen: ' + eventName);
});

busServer.addListener('unlisten', function(clientId, eventName, payload) {
    sys.puts('unlisten: ' + eventName);
});

httpServer.listen(8080);