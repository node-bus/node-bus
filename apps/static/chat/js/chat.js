(function(){
    function Chat($messages){
        // summary:
        //          Creates a new instance of a Chat client. Assumes that 
        //          bus.client.js is already in the dom.
        this.bus = getBus();
        this.$messages = $messages;
        
        this.bus.subscribe("chat/login", this, this.handleLogin);
        this.bus.subscribe("chat/message", this, this.handleMessage);
    }
    Chat.prototype = {
        // bus: Object
        //          node-bus client object. See bus.client.js for more details.
        bus: null,
        
        // username: String
        //          Username of the client.
        username: "",
        
        // $messages: jQuery NodeList
        //          Used to add messages to the list.
        $messages: null,
    
        login: function(username){
            // summary:
            //          "logs in" to the service.  It sends a chat/login event.
            // username: String
            //          Username for the client.
            
            this.username = username;
            
            this.bus.pub("chat/login", {username: this.username});
        }, 
        
        handleLogin: function(event){
            // summary:
            //          Handles when users log into the chat system.
            // event: Object
            //          Event object for chat/login events.
            
            this.addLoginMessage(event.username);
        },
        
        sendMessage: function(message){
            // summary:
            //          Sends a message to the chat service.
            // message: String
            //          Message to send.
            this.bus.pub("chat/message", {username: this.username, message: message});
        },
        
        handleMessage: function(event){
            // summary:
            //          Handles a reciept of a message from the chat service.
            // event:
            //          Event object for the chat/message events.
            
            this.addMessage(event.username, event.message);
        },
        
        getTimeString: function(){
            var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var ampm = "AM";
            
            if(hours >= 12){
                ampm = "PM";
                
                if(hours > 12){
                    hours = hours - 12;
                }
            }
            
            if(hours < 10){
                hours = "0"+hours;
            }
            if(minutes < 10){
                minutes = "0"+minutes;
            }
            if(seconds < 10){
                seconds = "0"+seconds;
            }
            
            return hours+":"+minutes+":"+seconds+" "+ampm;
        },
        
        addLoginMessage: function(user){
            // summary:
            //          Adds a login message to the $messages list.
            // user: String
            //          Username of the user to log in.
            
            this.$messages.prepend('<li><span class="time">'+this.getTimeString()+'</span><span class="username '+(user === this.username ? 'me' : '')+'">'+user+'</span> has logged on.</li>');
        },
        
        addMessage: function(user, message){
            // summary:
            //          Adds a message to the $messages list.
            // user: String
            //          User who posted the message.
            // message: String
            //          Message they posted.
            
            this.$messages.prepend('<li><span class="time">'+this.getTimeString()+'</span><span class="username '+(user === this.username ? 'me' : '')+'">'+user+'</span> <span class="message">'+message+'</span></li>');
        }
    };

    window.Chat = Chat;
})();