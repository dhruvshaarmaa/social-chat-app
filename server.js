const express=require("express");
const http=require("http");
const socketio=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=socketio(server);

const {formatMessage} = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const port=process.env.PORT || 3000;

// set route for static folder
app.use("/",express.static(__dirname+"/public"));

const chatBot="ChatBot";

//client connection
io.on("connection",(socket)=>{

    socket.on("joinroom",({username,room})=>{
        const user= userJoin(socket.id,username,room);

        socket.join(user.room);

        //welcome message to user
        socket.emit("message",formatMessage(chatBot,"Welcome to the Chat App"));

        //user join the room info
        socket.broadcast.to(user.room).emit("message",formatMessage(chatBot,`${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //chat message received from user
    socket.on("chatMessage",(msg)=>{
        const user=getCurrentUser(socket.id);
        //message send to all users in the room
        io.to(user.room).emit("message",formatMessage(user.username,msg));
    });

    //leave the room
    socket.on("disconnect",()=>{
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message',formatMessage(chatBot, `${user.username} has left the chat`)
            );
      
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room)
            });
          }
    });

});

server.listen(port,()=>{
    console.log(`Server started on http://localhost:${port}`);
});