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
        //Broadcast welcome to new users
        socket.on('welcome', (msg, userName) => {
            //TODO Need to set username here
            let un = "willremovethis";
            //
            this.namespace.emit('welcome', msg);
            this.users.push(userName);
            socket.broadcast.emit('userList', this.users);
        });

        //Recieves chat message and sends it out to all including sender
        socket.on('chat message', (msg) => {
            //TODO Need to save message to database, associated with user
            this.namespace.emit('chat message', msg);
        });

        //Recieves alert that a user is typing
        socket.on('typing', (userName) => {
            this.typingUsers.push(userName);
            userIsTypingOutput(false);
        });

        //Recieves alert that a user is done typing
        socket.on('doneTyping', (userName) => {
            let i = this.typingUsers.indexOf(userName);
            this.typingUsers.splice(i, 1);
            userIsTypingOutput(true);
        });

        //Disconnection
        socket.on('disconnect', (reason) => {
            //TODO Need to change out USERNAME with database version
            let username = "willremovethis";
            socket.broadcast.emit('userLeave', `USERNAME left the chat`);

            //Remove user from the userlist
            let i = this.users.indexOf(username);
            this.users.splice(i, 1);

            //if user was typing remove them from the istyping list
            i = this.typingUsers.indexOf(username);
            if (i !== -1) {
                this.typingUsers.splice(i, 1);
                userIsTypingOutput(true);
            }});

        const userIsTypingOutput = (isDone) => {
            if (this.typingUsers.length >= 2) {
                let outputString = this.typingUsers[0];
                for (let i = 1; i < this.typingUsers.length; i++) {
                    outputString += `, ${this.typingUsers[i]}`;
                }
                outputString += " are typing...";
                this.namespace.emit('typing', outputString, this.typingUsers);
            } else if (this.typingUsers.length === 1 && !isDone) {
                this.namespace.emit('typing', `${this.typingUsers[0]} is typing...`, this.typingUsers);
            } else if (this.typingUsers.length <= 1) {
                this.namespace.emit('doneTyping');
            }
        }

    }
}
module.exports = Chatroom;