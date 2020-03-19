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

//Start listening for connections
const Mainroom = new Chatroom('', io);




