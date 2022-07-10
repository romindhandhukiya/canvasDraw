const express = require("express");
const socket = require("socket.io");

const app = express(); //initialize and ready the server
app.use(express.static("public"));

let port = process.env.PORT || 3000;
let server = app.listen(port, ()=> {
    console.log("listening to port");
});

let io = socket(server);
io.on("connection", (socket)=> {
    console.log("connected");

    //recieved data
    socket.on("beginPath", (data) => {
        //transfer to all connected computer //data from frontend
        io.sockets.emit("beginPath", data);
    })

    socket.on("drawStroke", (data) => {
        io.sockets.emit("drawStroke", data);
    })

    socket.on("undoRedo", (data) => {
        io.sockets.emit("undoRedo", data);
    })
})