var http = require('http');
var fs = require('fs');
var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var app = express();
var server = app.listen(8000, function() { console.log("listening on port 8000"); });
var io = require('socket.io').listen(server);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(express.static('Semantic-UI'));

// root route to render the index.ejs view
app.get('/', function(req, res) {
 res.render("index");
});

app.get('/cards', function(req, res) {
 res.render("cards");
});

var rooms = {};
var room;
io.sockets.on('connection', function (socket) {
  
  socket.on('chat_room', function (data) {
    room = data.room;
    console.log('room\n', room);
    if (!rooms[room]) {
      rooms[room] = {};
    }
    socket.join(room);
  });

  socket.on('client_new_user', function (data) {
    if (rooms[room].users) {
      rooms[room].users.push(data);
    } else {
      rooms[room].users = [];
      rooms[room].users.push(data);
    }
    io.to(room).emit('all_messages', rooms[room].messages);
  });

  socket.on('new_message', function (data) {
   if (rooms[room].messages) {
      console.log("\nYES IT DOES HAVE A MESSAGES PROPERTY!!\n");
      rooms[room].messages.push(data);
    } else {
      console.log("\nNOOOOO IT DOES NOT HAVE A MESSAGES PROPERTY!!\n");
      rooms[room].messages = [];
      rooms[room].messages.push(data);
    }
    io.to(room).emit('update_messages', data);
  });

  socket.on('client_remove_user', function (data) {
    for (var i = 0; i < rooms[room]['users'].length; i++) {
      if (rooms[room].users[i]['name'] == data.name) {
        rooms[room].users.splice(i,1);
      }
    }
  });

  
});