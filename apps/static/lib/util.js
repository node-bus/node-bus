function getBus() {
    var host = window.location.hostname || "localhost";
    var port = window.location.port || 8080;
    var url = "http://" + host + ":" + port;
    return new Bus(url);
}