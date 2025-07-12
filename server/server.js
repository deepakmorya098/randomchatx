const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store user info and partner mapping
let partnerMap = {}; // socket.id -> partnerId
let userInfo = {};   // socket.id -> { gender, country }

function getCountryMock() {
  const countries = ["IN", "US", "CA", "UK", "DE", "AU", "FR"];
  return countries[Math.floor(Math.random() * countries.length)];
}

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Step 1: Join queue
  socket.on("join", ({ gender }) => {
    console.log("🔗 Join request:", socket.id);

    const country = getCountryMock();
    userInfo[socket.id] = { gender, country };

    const waiting = Object.keys(partnerMap).find(
      (id) => partnerMap[id] === null && id !== socket.id
    );

    if (waiting) {
      partnerMap[socket.id] = waiting;
      partnerMap[waiting] = socket.id;

      const p1 = userInfo[socket.id];
      const p2 = userInfo[waiting];

      // Notify both users about the match
      socket.emit("matched", {
        partnerId: waiting,
        gender: p2.gender,
        country: p2.country,
      });

      io.to(waiting).emit("matched", {
        partnerId: socket.id,
        gender: p1.gender,
        country: p1.country,
      });
    } else {
      partnerMap[socket.id] = null;
    }
  });

  // Step 2: Skip match
  socket.on("skip", () => {
    const partnerId = partnerMap[socket.id];
    if (partnerId) {
      partnerMap[partnerId] = null;
      io.to(partnerId).emit("stranger-disconnected");
    }
    partnerMap[socket.id] = null;
    socket.emit("stranger-disconnected");
    socket.emit("join-again");
  });

  // Step 3: WebRTC signaling
  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  // ✅ Step 4: Real-time Chat
  socket.on("chat-message", (msg) => {
    const partnerId = partnerMap[socket.id];
    if (partnerId) {
      io.to(partnerId).emit("chat-message", msg);
    }
  });

  // Step 5: Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    const partnerId = partnerMap[socket.id];
    if (partnerId) {
      io.to(partnerId).emit("stranger-disconnected");
      partnerMap[partnerId] = null;
    }
    delete partnerMap[socket.id];
    delete userInfo[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
