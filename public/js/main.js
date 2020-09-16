let chatForm=document.getElementById("chat-form");
let chatMessages=document.querySelector(".chat-messages");
let roomName = document.getElementById('room-name');
let userList = document.getElementById('users');

// Get username and room from URL
//using qs cdn 
const { username, room } = Qs.parse(location.search, {
    //to ignore ?,= symbols in url
    ignoreQueryPrefix: true
  });

const socket=io();
//console.log(username,room);

//join room 
socket.emit("joinroom",{ username, room });

//received message from server
socket.on("message",(message)=>{
    console.log(message);
    outputMessage(message);

    //scroll down 
    /*
    scrollHeight: total container size.
    scrollTop: amount of scroll user has done.
    */
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

chatForm.addEventListener("submit",(e)=>{
    //false submit
    e.preventDefault();
    const msg=e.target.elements.msg.value;

    //emit message to server
    socket.emit("chatMessage",msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
  });
  

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
  }

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach(user=>{
        $("#users").append(
            `<li>${user.username}</li>
            `
        );
    });
   }

//adding messages to chatbox
function outputMessage(message){
    $("#chatBox").append(
        `<div class="message">
            <p class="meta">${message.username} | <span>${message.time}</span></p>
            <p class="text">${message.body}</p>
        </div>
        `
    );
}