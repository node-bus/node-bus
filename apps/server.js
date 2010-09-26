#!/usr/local/bin/node

var router = require('./lib/node-router');
var http = require('http');
var url = require('url');
var sys = require('sys');
var bus = require('./lib/node-bus/bus.server');

var NODEBUS_PATTERN = /\/nodebus/;

var dirHandler = router.staticDirHandler("static/", "", ["index.html"]);
var httpServer = http.createServer();
var busServer = new bus.BusServer(httpServer, NODEBUS_PATTERN);

httpServer.addListener('request', function (req, res) {
    if(req.method === "GET" && !NODEBUS_PATTERN.test(req.url)) {
        return dirHandler(req, res);
    }
});

busServer.addListener('receive', function(clientId, eventName, payload) {
    sys.puts('receive: ' + eventName + ", " + payload);
});

busServer.addListener('listen', function(clientId, eventName) {
    sys.puts('listen: ' + eventName);
});

busServer.addListener('unlisten', function(clientId, eventName, payload) {
    sys.puts('unlisten: ' + eventName);
});

httpServer.listen(8080);