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

io.on('connection', onConnect);

function onConnect(socket){
  let userName;
  allClients.push(socket);
  //Welcome new users
  socket.on('welcome', (msg, name)=>{
    socket.broadcast.emit('welcome', msg);
    userName = name;
    users.push(userName);
  });

  //Recieves chat message and sends it out to all including sender
  socket.on('chat message', (msg)=>{
    io.emit('chat message', msg);
  });

  //Disconnection
  socket.on('disconnect', (reason)=>{
      console.log(reason);
      socket.broadcast.emit('leave', `${userName} left the chat`);
      let i = allClients.indexOf(socket);
      allClients.splice(i, 1);
      users.splice(i, 1);
  });
  }







http.listen(3000, function(){
  console.log('listening on *:3000');
});
