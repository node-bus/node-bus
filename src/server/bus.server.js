var sys = require('sys'),
    events = require("events"),
    io = require('./socket.io');
    
var RESERVED_EVENT_PREFIX = '__node-bus__';
    
// summary:
//          Initialize the Bus system.
// description:
//          Sets up listeners for events on the httpServer object when they
//          match the given pattern.
// httpServer: http.Server
//          Http Server object.
// pattern: RegExp
//          URL pattern to match.
// returns: 
//          Nothing.
function BusServer(httpServer) {
    events.EventEmitter.call(this);
    var self = this;
    
    //handles executing callbacks when an event occurs
    self.pubsub = new PubSubClient();
    
    //mapping of client id => {event name => handle}
    self.clientSubscriptions = {};
    
    //the socket.io server
    self.socketServer = io.listen(httpServer);
    
    //performs transformations on events
    self.transformers = new TransformerEngine();
    
    //Called when a message is received
    self._receive = function(client, obj) {
        self.emit('preTransform', client, obj);
        
        //Transform the object
        obj = self.transformers.process(client, obj);
        if(!obj) return;
        
        self.emit('postTransform', client, obj);
        
        var eventName = obj.name, payload = obj.payload;
        
        //if this is a special event...
        if(eventName.substr(0, RESERVED_EVENT_PREFIX.length) == RESERVED_EVENT_PREFIX) {
            var specialEventName = eventName.substr(RESERVED_EVENT_PREFIX.length);
            
            //emit listen and unlisten events
            if(specialEventName == '/listen') {
                self.emit('listen', client, payload);
            } else if(specialEventName == '/unlisten') {
                self.emit('unlisten', client, payload);
            }
        }
        
        self.pubsub.fireEvent(eventName, payload);
    };
    
    //Called when a client wants to listen to a new event
    self._handleListen = function(client, eventName) {
        if(!client) return;
        
        //unlisten the client if it's somehow listening already
        self._handleUnlisten(client, eventName);
        
        var clientId = client.sessionId;
        var container = self.clientSubscriptions[clientId];
        if(!container) self.clientSubscriptions[clientId] = container = {};
        
        var subscription = self.pubsub.subscribe(eventName, function() {
            client.send(JSON.stringify({
                name: eventName,
                payload: Array.prototype.splice.call(arguments, 0)
            }));
        });
        
        container[eventName] = subscription.handle;
    };
    
    //Called when a client wants to unlisten to an event
    self._handleUnlisten = function(client, eventName) {
        if(!client) return;
        
        var container = self.clientSubscriptions[client.sessionId];
        if(!container) return;
        
        var handle = container[eventName];
        if(!handle) return;
        
        self.pubsub.unsubscribe(handle);
        delete container[eventName];
    };
    
    //Called when a user connects
    self._handleConnection = function(client) {
        self.emit('connect', client);
        
        //Called when a message is received
        client.addListener('message', function(message) {
            try {
                var json = JSON.parse(message);
            } catch(e) {
                self.emit('invalidMessage', client, message);
                return;
            }
    
            self._receive(client, json);
        });
        
        //Called when a user disconnects
        client.addListener('disconnect', function() {
            self.emit('disconnect', client);
            
            var container = self.clientSubscriptions[client.sessionId];
            if(!container) return;
            
            var pubsub = self.pubsub;
    
            for(var eventName in container) {
                var handle = container[eventName];
                pubsub.unsubscribe(handle);
            }
            
            delete self.clientSubscriptions[client.sessionId];
        });
    };
    
    self.publish = function(eventName, payload) {
        self._receive(null, {
            name: eventName,
            payload: payload
        });
    };
    
    self.subscribe = function() {
        var results = self.pubsub.subscribe.apply(self.pubsub, arguments);
        return results.handle;
    };
    
    self.unsubscribe = function(handle) {
        var results = self.pubsub.unsubscribe(handle);
        return results.removed;
    };
    
    self.addTransformer = function(transformer) {
        self.transformers.register(transformer);
    };
    
    self.removeTransformer = function(transformer) {
        self.transformers.unregister(transformer);
    };
    
    self.addListener('listen', self._handleListen);
    self.addListener('unlisten', self._handleUnlisten);
    self.socketServer.addListener('connection', self._handleConnection);
    
    //Transformer to ensure that a message is valid
    self.transformers.register(function(client, obj) {
        var error = function() {
            self.emit('invalidJSON', client, obj);
            return null;
        }
        
        if(typeof(obj) != 'object' || obj == null) return error();
        
        var name = obj.name, payload = obj.payload;
        if(typeof(name) != 'string' || typeof(payload) != 'object' || !payload || !payload.length) return error();
        
        return obj;
    });
}

sys.inherits(BusServer, events.EventEmitter);
exports.BusServer = BusServer;