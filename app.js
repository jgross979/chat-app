//Import express and express session for routing and sessions
const express = require('express');
const session = require('express-session');
const app = express();

//Socket.io setup
const http = require('http').createServer(app);
const Server = require('socket.io');
const io = new Server(http);


// Requiring passport as we've configured it
const passport = require("./config/passport");

//Set up port
const port = process.env.PORT || 3000;

//Import models folder (for database) and set important relationships
const db = require("./models");
db.User.hasMany(db.Message); //Set one to many relationship
db.Message.belongsTo(db.User);


// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(function() {
  http.listen(port, function(){
    console.log(`listening on *:${port}`);
  });
});

/************EXPRESS CONFIGURATION*********************/
//Set up public directory for use
app.use(express.static(__dirname + '/public'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


/****************SET UP PASSPORT SESSION***************/
// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


/**************GET ROUTES**********************/
// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

/************SERVER DATA****************/
let allClients = [];
let users = [];
let typingUsers = [];

/************SOCKET MANAGEMENT****************/
const Chatroom = require("./services/Chatroom");
const main = new Chatroom('', io);

main.listen();
// io.on('connection', onConnect);
//
// function onConnect(socket){
//   let userName;
//   allClients.push(socket);
//   io.emit('userList', users);
//
//   //Welcome new users
//   socket.on('welcome', (msg, name)=>{
//     socket.broadcast.emit('welcome', msg);
//     userName = name;
//     users.push(userName);
//     io.emit('userList', users);
//   });
//
//   //Recieves chat message and sends it out to all including sender
//   socket.on('chat message', (msg)=>{
//     io.emit('chat message', msg);
//   });
//
//   //Recieves alert that a user is typing
//   socket.on('typing', (userName)=>{
//     typingUsers.push(userName);
//     userIsTypingOutput(socket, false);
//   });
//
//   //Recieves alert that user is done typing
//   socket.on('doneTyping', (userName)=>{
//     let i = typingUsers.indexOf(userName);
//     typingUsers.splice(i, 1);
//     userIsTypingOutput(socket, true);
//   });
//
//   //Disconnection
//   socket.on('disconnect', (reason)=>{
//       socket.broadcast.emit('userLeave', `${userName} left the chat`);
//       let i = allClients.indexOf(socket);
//       allClients.splice(i, 1);
//       users.splice(i, 1);
//       //user done typing event
//       i = typingUsers.indexOf(userName);
//       if(i !== -1){
//         typingUsers.splice(i, 1);
//         userIsTypingOutput(socket, true);
//       }
//       //    ----
//       io.emit('userList', users);
//   });
//   }
//
//   function userIsTypingOutput(socket, isDone){
//     if(typingUsers.length >= 2){
//       let outputString = typingUsers[0];
//       for(i = 1; i < typingUsers.length; i ++){
//         outputString += `, ${typingUsers[i]}`;
//       }
//       outputString += " are typing...";
//       socket.broadcast.emit('typing', outputString, typingUsers);
//     }else if(typingUsers.length === 1 && !isDone){
//       socket.broadcast.emit('typing', `${typingUsers[0]} is typing...`, typingUsers);
//     }else if(typingUsers.length <= 1){
//       socket.broadcast.emit('doneTyping');
//     }
//   }


