// server.js  –  RandomChatX backend
const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");
const cors    = require("cors");

const app = express();
app.use(cors());

// ───────── Socket.io setup ─────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// ───────── State ─────────
const partnerMap = {};      // socket.id  -> partnerId | null
const userInfo   = {};      // socket.id  -> { gender, age, country }

// mock a random country code (replace with real IP lookup if needed)
const countries = ["IN", "US", "CA", "UK", "DE", "AU", "FR"];
const getCountryMock = () =>
  countries[Math.floor(Math.random() * countries.length)];

// ───────── Main connection handler ─────────
io.on("connection", (socket) => {
  console.log("✅ user connected:", socket.id);

  // 1️⃣  Join queue
  socket.on("join", ({ gender, age }) => {
    const country = getCountryMock();
    userInfo[socket.id] = { gender, age, country };

    // find first waiting user (no filters)
    const waiting = Object.keys(partnerMap).find(
      (id) => partnerMap[id] === null && id !== socket.id
    );

    if (waiting) {
      partnerMap[socket.id] = waiting;
      partnerMap[waiting]  = socket.id;

      const me   = userInfo[socket.id];
      const them = userInfo[waiting];

      // notify both peers
      socket.emit("matched", {
        partnerId: waiting,
        gender   : them.gender,
        age      : them.age,
        country  : them.country,
      });

      io.to(waiting).emit("matched", {
        partnerId: socket.id,
        gender   : me.gender,
        age      : me.age,
        country  : me.country,
      });
    } else {
      partnerMap[socket.id] = null; // wait in queue
    }
  });

  // 2️⃣  Skip current partner
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

  // 3️⃣  WebRTC signaling passthrough
  socket.on("offer",        ({ offer,        to }) => io.to(to).emit("offer",        { offer,  from: socket.id }));
  socket.on("answer",       ({ answer,       to }) => io.to(to).emit("answer",       { answer, from: socket.id }));
  socket.on("ice-candidate",({ candidate,    to }) => io.to(to).emit("ice-candidate",{ candidate }));

  // 4️⃣  Real‑time chat
  socket.on("chat-message", (msg) => {
    const partnerId = partnerMap[socket.id];
    if (partnerId) io.to(partnerId).emit("chat-message", msg);
  });

  // 5️⃣  Disconnect cleanup
  socket.on("disconnect", () => {
    console.log("❌ user disconnected:", socket.id);
    const partnerId = partnerMap[socket.id];
    if (partnerId) {
      io.to(partnerId).emit("stranger-disconnected");
      partnerMap[partnerId] = null;
    }
    delete partnerMap[socket.id];
    delete userInfo[socket.id];
  });
});

// ───────── Start server ─────────
server.listen(5000, () =>
  console.log("🚀 Socket server running on http://localhost:5000")
);
