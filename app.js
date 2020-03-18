const express = require('express');
const session = require('session');
const app = express();
const http = require('http').createServer(app);
const Server = require('socket.io');
const io = new Server(http);
const mysql = require('mysql');

//Import the models folder
const db = require("./models");

/************EXPRESS CONFIG*********************/
//Set up public directory for use
app.use(express.static(__dirname + '/public'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

/************CONNECTIONS/ROUTING****************/
const port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/signup', function(req, res){
  res.sendFile(__dirname + '/signup.html');
});

// Access signup results as request.body
app.post('/signup', function(req, res){
  console.log(req.body.user.username);
  console.log(req.body.user.psw);
  console.log(req.body.user.psw_repeat);
  res.sendFile(__dirname + '/index.html');
});

/************MYSQL CONNECTION****************/
var con = mysql.createConnection({
  host: "localhost",
  user: "dev",
  password: "chatapplication"
});

// var values = [
//   ['test1' , 'pass'],
//   ['test2' , 'pass'],
//   ['test3' , 'pass'],
//   ['test4' , 'pass'],
//   ['test5' , 'pass'],
//   ['test6' , 'pass'],
//   ['test7' , 'pass'],
//   ['test8' , 'pass'],
//   ['test9' , 'pass'],
//   ['test10', 'pass'],
//   ['test11', 'pass'],
//   ['test12', 'pass'],
//   ['test13', 'pass'],
//   ['test14', 'pass']
// ];
//
// let sql_insert = "INSERT INTO `chat_application`.`User` (Username, Password) VALUES ?";

// con.query(sql_insert, [values], function (err, result) {
//   if (err) throw err;
//   console.log("Number of records inserted: " + result.affectedRows);
// });

let sql_select = "SELECT *\n" +
          "FROM `chat_application`.`User`";

con.query(sql_select, function (err, result) {
  if (err) throw err;
  for(let i = 0; i < result.length; i ++){
    console.log("User_ID: "+ result[i].User_ID +" Username: " + result[i].Username + " Password: " + result[i].Password);
  }
});


/************SERVER DATA****************/
let allClients = [];
let users = [];
let typingUsers = [];

/************SOCKET MANAGEMENT****************/
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


app.listen(port, function(){
  console.log(`listening on *:${port}`);
});
