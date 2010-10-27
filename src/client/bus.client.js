;(function(){
    function Bus(host, port, path) {
        this.path = path.substr(-1) == '/' ? path : path + '/';
        io.setPath(this.path + 'socket.io');
        
        this.socket = new io.Socket(host, port ? {port: port} : {});
        this.socket.connect();
        
        this.pubsub = new PubSubClient();
        var self = this;
        
        this.socket.addEvent('message', function(data) {
            var json = JSON.parse(data);
            json = self.transformers.process(null, json);
            self.pubsub.fireEvent(json.name, json.payload);
        });
    };
    
    Bus.prototype = {
        // socket: Object
        //          Instance of the socket.io connection.
        socket: null,
        
        // pubsub: Object
        //          Instance of the pubsub client.
        pubsub: null,
        
        // transformers: Object
        //          Instance of the transformation engine. 
        transformers: new TransformerEngine(),
        
        // summary:
        //          Subscribes to an event when given a callback and an
        //          optional scope for the callback.
        // eventName: String
        //          Name of the event.
        // scope: Object (Optional)
        //          Calling-scope of the listener callback.
        // callback: Function
        //          Function that is listening for the eventName event.
        // return: 
        //          The subscription handle.
        subscribe: function(eventName /*, scope (optional), callback*/) {
            var results = this.pubsub.subscribe.apply(this.pubsub, arguments);
            
            if(results.isFirstSubscription) {
                this.publish('__node-bus__/listen', eventName);
            }
            
            return results.handle;
        },
        
        // summary:
        //          Unsubscribes from an event.
        // handle: Object
        //          The object to unsubscribe.
        // return:
        //          Whether or not the unsubscribe action was successful.  
        //          If the function and scope were not found as a listener 
        //          to the event, false will be returned.
        unsubscribe: function(handle) {            
            var results = this.pubsub.unsubscribe(handle);
            
            if(results.isLastSubscription) {
                this.publish('__node-bus__/unlisten', handle.eventName);
            }
            
            return results.removed;
        },
        
        // summary:
        //          Publishes an event.
        // arguments:
        //          Arguments to publish with the event.
        // eventName:
        //          Name of the event.
        publish: function(eventName /*,arguments*/) {
            var json = JSON.stringify({
                name: eventName,
                payload: Array.prototype.splice.call(arguments, 1)
            });
            
            this.socket.send(json);
        },
        
        sub: function() { return this.subscribe.apply(this, arguments); },
        unsub: function() { return this.unsubscribe.apply(this, arguments); },
        pub: function() { return this.publish.apply(this, arguments); }
    };
    
    this.Bus = Bus;
})(window);
