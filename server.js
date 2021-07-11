const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');




const app = express();



app.use(express.static(path.join(__dirname, 'public')));




const server = http.createServer(app);
const io = socketio(server);




// COPY OF MONGO SCRIPT

//const { MongoClient } = require('mongodb');
//const uri = "mongodb+srv://drewface007:Drew3739()@drewchatdb.ef6ce.mongodb.net/chats?retryWrites=true&w=majority";
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//client.connect(err => {
  //const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  //client.close();
//});







const botName = 'ChatBot';

//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room);

        //let chat = db.collection('chats');
        //chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            //if(err){
              //  throw err;
            //}

            //load messages
            //socket.emit('output', res);
        //})

        // wecome current user
     socket.emit('message', formatMessage(botName, `Welcome to DrewChat!`));

        // broadcast when user connects
        socket.broadcast.to(user.room).emit(
        'message',
        formatMessage(botName,  `${user.username} has joined DrewChat`)
        );

        // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    // broadcast when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName,  `${user.username} has left DrewChat`));
            
            // send users and room info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
            });
            
            

        }
        
    });

    // listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
});
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));