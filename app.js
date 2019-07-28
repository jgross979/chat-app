const express = require('express');
const app = express();
const http = require('http').createServer(app);
const Server = require('socket.io');
const io = new Server(http);



app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

/************SOCKET MANAGEMENT****************/
let allClients = [];
let users = [];
let typingUsers = [];

io.on('connection', onConnect);

function onConnect(socket){
  let userName;
  allClients.push(socket);
  io.emit('userList', users);

  //Welcome new users
  socket.on('welcome', (msg, name)=>{
    socket.broadcast.emit('welcome', msg);
    userName = name;
    users.push(userName);
    io.emit('userList', users);
  });

  //Recieves chat message and sends it out to all including sender
  socket.on('chat message', (msg)=>{
    io.emit('chat message', msg);
  });

  //Recieves alert that a user is typing
  socket.on('typing', (userName)=>{
    typingUsers.push(userName);
    userIsTypingOutput(socket, false);
  });

  //Recieves alert that user is done typing
  socket.on('doneTyping', (userName)=>{
    console.log('done typing');
    let i = typingUsers.indexOf(userName);
    typingUsers.splice(i, 1);
    userIsTypingOutput(socket, true);
  });

  //Disconnection
  socket.on('disconnect', (reason)=>{
      console.log(reason);
      socket.broadcast.emit('userLeave', `${userName} left the chat`);
      let i = allClients.indexOf(socket);
      allClients.splice(i, 1);
      users.splice(i, 1);
      //user done typing event
      i = typingUsers.indexOf(userName);
      if(i !== -1){
        typingUsers.splice(i, 1);
        userIsTypingOutput(socket, true);
      }
      //    ----
      io.emit('userList', users);
  });
  }

  function userIsTypingOutput(socket, isDone){
    if(typingUsers.length >= 2){
      let outputString = typingUsers[0];
      for(i = 1; i < typingUsers.length; i ++){
        outputString += `, ${typingUsers[i]}`;
      }
      outputString += " are typing...";
      socket.broadcast.emit('typing', outputString, typingUsers);
    }else if(typingUsers.length === 1 && !isDone){
      socket.broadcast.emit('typing', `${typingUsers[0]} is typing...`, typingUsers);
    }else if(typingUsers.length <= 1){
      socket.broadcast.emit('doneTyping');
    }
  }







http.listen(3000, function(){
  console.log('listening on *:3000');
});
