(function(){
    function Draw($canvas, $userList){
        // summary:
        //          Creates a new instance of a Draw client. Assumes that 
        //          bus.client.js is already in the dom.
        
        this.bus = new Bus('http://' + window.location.hostname + ':' + window.location.port);
        this.$canvas = $canvas;
        this.$userList = $userList;
        
        this.bus.sub("draw/login", this, this.handleLogin);
        this.bus.sub("draw/draw", this, this.handleDraw);
        
        $canvas.mousedown($.proxy(this.handleMouseDown, this));
        $canvas.mouseup($.proxy(this.handleMouseUp, this));
        $canvas.mousemove($.proxy(this.handleMouseMove, this));
        
        $canvas.attr('width', $(document).width());
        $canvas.attr('height', $(document).height());
    }
    Draw.prototype = {
        // bus: Object
        //          node-bus client object. See bus.client.js for more details.
        bus: null,
        
        // username: String
        //          Username of the client.
        username: "",
        
        // $canvas: jQuery NodeList
        //          jQuery selector to the canvas to draw on.
        $canvas: null,
        
        // context: Object
        //          Used for drawing.
        context: null,
        
        // $userList: jQuery NodeList
        //          Used to show current users.
        $userList: null,
        
        // connectedUsers: Object
        //          Stores flags for which users have connected or sent drawing 
        //          messages, so we can handle logins as well.
        connectedUsers: {},
        
        // colorMap: Map
        //          Maps usernames to their associated colors
        colorMap: {},
        
        // curPath: Array
        //          Contains points in the currently drawing path, or is null
        //          if nothing is currently being drawn
        curPath: null,
    
        login: function(username){
            // summary:
            //          "logs in" to the service.  It sends a chat/login event.
            // username: String
            //          Username for the client.
            
            this.username = username;
            this.context = this.$canvas[0].getContext('2d');
            
            this.connectedUsers[username] = true;
            
            this.bus.pub("draw/login", {
                username: this.username,
                color: Math.round(0xffffff * Math.random())
            });
        }, 
        
        handleLogin: function(event){
            // summary:
            //          Handles when users log into the chat system.
            // event: Object
            //          Event object for chat/login events.
            var color = '#' + event.color.toString(16);
            this.colorMap[event.username] = color;
            this.$userList.append('<li><span class="user_color" style="background-color: ' + color + ';"> </span>&nbsp;&nbsp;' + event.username + '</li>');
            
            this.connectedUsers[event.username] = true;
        },
        
        handleDraw: function(event){
            // summary:
            //          Handles a reciept of a message from the chat service.
            // event:
            //          Event object for the chat/message events.
            if(event.username != this.username) {
                // if the user isn't on our user list, add them now
                if(this.connectedUsers[event.username] !== true){
                    event.color = Math.round(0xffffff * Math.random());
                    this.handleLogin(event);
                }
            
                var path = event.draw;
                this.beginDrawing(path[0], path[1], event.username);
                
                for(var i=2, len=path.length; i<len; i+=2) {
                    this.addToDrawing(path[i], path[i + 1]);
                }
            }
        },
        
        handleMouseDown: function(event){
            // summary:
            //          Handles mouse down events on the canvas.
            // event:
            //          The jquery event object.
            var x = event.pageX;
            var y = event.pageY;
            this.beginDrawing(x, y, this.username);
            this.curPath = [x, y];
        },
        
        
        handleMouseUp: function(event){
            // summary:
            //          Handles mouse up events on the canvas.
            // event:
            //          The jquery event object.
            
            this.context.closePath();
            this.bus.pub("draw/draw", {username: this.username, draw: this.curPath});
            this.curPath = null;
        },
        
        handleMouseMove: function(event){
            // summary:
            //          Handles mouse movement events on the canvas.
            // event:
            //          The jquery event object.
            
            if(this.curPath) {
                var x = event.pageX;
                var y = event.pageY;
                this.addToDrawing(x, y);
                this.curPath.push(x, y);
            }
        },
        
        beginDrawing: function(x, y, username) {
            // summary:
            //          Begins drawing a path.
            // x: Int
            //          The starting x position.
            // y: Int
            //          The starting y position.
            // username: String
            //          The owner of the path (determines the color of the lines).
            this.context.beginPath();
            this.context.strokeStyle = this.colorMap[username];
            this.context.moveTo(x, y);
        },
        
        addToDrawing: function(x, y) {
            // summary:
            //          Adds a position to the current path.
            // x: Int
            //          The x position.
            // y: Int
            //          The y position.
            this.context.lineTo(x, y);
            this.context.stroke();
        }
    };

    window.Draw = Draw;
})();