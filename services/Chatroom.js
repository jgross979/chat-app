class Chatroom {
    constructor(name, io) {
        this.name = name;
        this.users = [];
        this.typingUsers = [];
        this.namespace = io.of('/' + name);
        this.listen();
    }

    listen() {
        this.namespace.on('connection', this.handleConnection);
    }

    handleConnection = (socket) => {
        socket.on('welcome', this.handleWelcome);
        socket.on('chat message', this.handleChatMessage);
        socket.on('typing', this.handleTyping);
        socket.on('doneTyping', this.handleDoneTyping);
        socket.on('disconnect', this.handleDisconnect);
    }

    //Broadcast welcome to new users
    handleWelcome = (msg, userName) => {
        //TODO Need to set username here
        let un = "willremovethis";
        //
        this.namespace.emit('welcome', msg);
        this.users.push(userName);
        this.namespace.emit('userList', this.users);
    }

    //Recieves chat message and sends it out to all including sender
    handleChatMessage = (msg) => {
        //TODO Need to save message to database, associated with user
        this.namespace.emit('chat message', msg);
    }

    //Recieves alert that a user is typing
    handleTyping = (userName) => {
        this.typingUsers.push(userName);
        this.userIsTypingOutput(false);
    }

    //Recieves alert that a user is typing
    handleDoneTyping = (userName) => {
        let i = this.typingUsers.indexOf(userName);
        this.typingUsers.splice(i, 1);
        this.userIsTypingOutput(true);
    }

    //Disconnection
    handleDisconnect = (reason) => {
        //TODO Need to change out USERNAME with database version
        let username = "willremovethis";
        this.namespace.emit('userLeave', `USERNAME left the chat`);

        //Remove user from the userlist
        let i = this.users.indexOf(username);
        this.users.splice(i, 1);

        //if user was typing remove them from the istyping list
        i = this.typingUsers.indexOf(username);
        if(i !== -1){
            this.typingUsers.splice(i, 1);
            this.userIsTypingOutput(true);
        }

        //Send out new userList to all clients
        this.namespace.emit('userList', this.users);
    }

    userIsTypingOutput(isDone){
        if(this.typingUsers.length >= 2){
            let outputString = this.typingUsers[0];
            for(let i = 1; i < this.typingUsers.length; i ++){
                outputString += `, ${this.typingUsers[i]}`;
            }
            outputString += " are typing...";
            this.namespace.emit('typing', outputString, this.typingUsers);
        }else if(this.typingUsers.length === 1 && !isDone){
            this.namespace.emit('typing', `${this.typingUsers[0]} is typing...`, this.typingUsers);
        }else if(this.typingUsers.length <= 1){
            this.namespace.emit('doneTyping');
        }
    }
}
module.exports = Chatroom;