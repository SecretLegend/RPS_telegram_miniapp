import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import bot from './bot.js'

const app = express();

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "view")));
app.use(express.static(path.join(__dirname, "images")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const server = app.listen(PORT);
const io = new Server(server);

let room = [];

bot.launch()

function createRoom(socket, roomID, userName) {
  room[roomID] = { p1Choice: null, p1Score: 0 };
  console.log("Room created");
  socket.join(roomID);
  socket.to(roomID).emit("playersConnected", { roomID: roomID});
  return socket.emit("firstPlayer", {userName: userName});
}

function joinRoom(socket, roomID, userName) {

  // if (!io.sockets.adapter.rooms.has(roomID)) {
  //   return socket.emit("Not a ValidToken");
  // }
  
  if (!io.sockets.adapter.rooms.has(roomID)) {
    createRoom(socket, roomID, userName);
  }

  else {
    const roomSize = io.sockets.adapter.rooms.get(roomID).size;
    if (roomSize > 1) {
      return socket.emit("roomFull");
    }
  
    socket.join(roomID);
    room[roomID] = { p2Choice: null };
  
    socket.to(roomID).emit("playersConnected");
    socket.emit("playersConnected", {userName: userName});
  }

}

export { createRoom, joinRoom };

io.on("connection", (socket) => {
  console.log("client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    socket.broadcast.emit('clientDisconnected', { roomID: socket.roomID, messageID: socket.messageID });
  });

  socket.on("createRoom", (data) => {
    createRoom(socket, data.roomID, data.userName);
  });

  socket.on("joinRoom", (data) => {
    console.log("Joined Room");
    joinRoom(socket, data.roomID, data.userName);
  });

  socket.on("p1Choice", (data) => {
    if (data) {
      const choice = data.rpschoice;
      const roomID = data.roomID;
      room[roomID].p1Choice = choice;
      socket
        .to(roomID)
        .emit("p1Choice", { rpsValue: choice, score: room[roomID].p1Score });
      if (room[roomID].p2Choice) {
        return declareWinner(roomID);
      }
    }
  });

  socket.on("p2Choice", (data) => {
    if (data) {
      const choice = data.rpschoice;
      const roomID = data.roomID;
      room[roomID].p2Choice = choice;
      socket
        .to(roomID)
        .emit("p2Choice", { rpsValue: choice, score: room[roomID].p2Score });
      if (room[roomID].p1Choice) {
        return declareWinner(roomID);
      }
    }
  });



  socket.on("playerClicked", (data) => {
    const roomID = data.roomID;
    room[roomID].p1Choice = null;
    room[roomID].p2Choice = null;
    return socket.to(roomID).emit("playAgain");
  });

  socket.on("restartClicked", (data) => {
    return socket.to(data.roomID).emit("restartGame");
  })

  socket.on("exitGame", (data) => {
    const roomID = data.roomID;
    if (data.player) {
      socket.to(roomID).emit("player1Left");
    } else {
      socket.to(roomID).emit("player2Left");
    }
    return socket.leave(roomID);
  });
});

const declareWinner = (roomID) => {
  let winner;
  if (room[roomID].p1Choice == room[roomID].p2Choice) {
    winner = "draw";
  } else if (room[roomID].p1Choice == "rock") {
    if (room[roomID].p2Choice == "scissor") {
      winner = "p1";
    } else {
      winner = "p2";
    }
  } else if (room[roomID].p1Choice == "paper") {
    if (room[roomID].p2Choice == "scissor") {
      winner = "p2";
    } else {
      winner = "p1";
    }
  } else if (room[roomID].p1Choice == "scissor") {
    if (room[roomID].p2Choice == "rock") {
      winner = "p2";
    } else {
      winner = "p1";
    }
  }
  return io.sockets.to(roomID).emit("winner", winner);
};