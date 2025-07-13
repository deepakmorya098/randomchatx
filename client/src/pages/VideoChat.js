import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import io from "socket.io-client";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import "../styles/animations.css";

const socket = io("http://localhost:5000"); // 🔁 Change to your Vercel/Prod URL when deploying
const matchSound = new Audio("/music.mp3");

function VideoChat() {
  const location = useLocation();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [showMatched, setShowMatched] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [strangerGender, setStrangerGender] = useState("");
  const [strangerCountry, setStrangerCountry] = useState("");
  const [strangerAge, setStrangerAge] = useState("");

  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // 🔇 Stop background music
  useEffect(() => {
    location.state?.stopMusic?.();
  }, [location.state]);

  // 🔌 WebRTC & socket setup
  useEffect(() => {
    let retryTimer;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const gender = location.state?.gender || "male";
      const age = location.state?.age || "18-25";

      socket.emit("join", { gender, age });

      socket.on("matched", async ({ partnerId, gender, country, age }) => {
        setStrangerGender(gender);
        setStrangerCountry(country);
        setStrangerAge(age);
        setIsConnected(false);

        createPeer(partnerId);

        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socket.emit("offer", { offer, to: partnerId });
      });

      socket.on("offer", async ({ offer, from }) => {
        createPeer(from);
        await peerRef.current.setRemoteDescription(offer);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from });
      });

      socket.on("answer", ({ answer }) => {
        peerRef.current?.setRemoteDescription(answer);
      });

      socket.on("ice-candidate", ({ candidate }) => {
        peerRef.current?.addIceCandidate(candidate);
      });

      socket.on("chat-message", (msg) =>
        setChatMessages((prev) => [...prev, { type: "stranger", text: msg }])
      );

      socket.on("stranger-disconnected", handleSkip);

      socket.io.on("reconnect_attempt", () =>
        console.log("Trying to reconnect...")
      );

      socket.io.on("reconnect", () => {
        console.log("Reconnected!");
        socket.emit("join", { gender, age });
      });

      socket.on("disconnect", () => {
        console.warn("Socket disconnected, will retry…");
        retryTimer = setTimeout(() => socket.connect(), 3000);
      });
    };

    init();

    return () => {
      clearTimeout(retryTimer);
      socket.off();
      socket.disconnect();
      peerRef.current?.close();
    };
  }, [location.state?.age, location.state?.gender]);

  // 🎥 Create Peer
  function createPeer(partnerId) {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStreamRef.current
      ?.getTracks()
      .forEach((track) =>
        peerRef.current.addTrack(track, localStreamRef.current)
      );

    peerRef.current.ontrack = ({ streams }) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = streams[0];
        setIsConnected(true);
        setShowMatched(true);
        matchSound.play().catch(() => {});
        setTimeout(() => setShowMatched(false), 1500);
      }
    };

    peerRef.current.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("ice-candidate", { candidate, to: partnerId });
      }
    };

    peerRef.current.onconnectionstatechange = () =>
      console.log("Peer state:", peerRef.current.connectionState);
  }

  const flagEmoji = (cc) =>
    cc
      ? String.fromCodePoint(
          ...cc.toUpperCase().split("").map((c) => 127397 + c.charCodeAt())
        )
      : "";

  const handleSend = () => {
    if (!newMessage.trim()) return;
    socket.emit("chat-message", newMessage);
    setChatMessages((prev) => [...prev, { type: "me", text: newMessage }]);
    setNewMessage("");
  };

  const toggleMic = () => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setMicOn(t.enabled);
    }
  };

  const toggleCamera = () => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setCameraOn(t.enabled);
    }
  };

  const handleSkip = () => {
    peerRef.current?.close();
    peerRef.current = null;
    setChatMessages([]);
    setStrangerGender("");
    setStrangerAge("");
    setStrangerCountry("");
    setIsConnected(false);
    socket.emit("skip");
  };

  const handleDisconnect = () => {
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    socket.disconnect();
    window.location.href = "/";
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-gradient-to-br from-[#320041] via-[#711C91] to-[#FF4E8D] p-6 space-y-6 font-inter">
      <Helmet>
        <title>Live Video Chat - RandomChat X</title>
        <meta
          name="description"
          content="Live video chat with strangers, now with emojis & match sound!"
        />
      </Helmet>

      {/* Background animations */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-25 animate-pulse" />
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-400 text-xl animate-floatingHeart"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              fontSize: `${Math.random() * 18 + 12}px`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <motion.h1
        className="text-white text-4xl font-bold drop-shadow"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        🌀 RandomChat <span className="text-pink-400">X</span>
      </motion.h1>

      {showMatched && (
        <div className="absolute top-16 z-50 bg-gradient-to-r from-emerald-400 to-pink-500 text-white font-bold px-6 py-3 rounded-full shadow-2xl animate-pulse ring ring-white ring-offset-2 ring-offset-purple-900">
          ✨ Stranger Matched!
        </div>
      )}

      {/* Video Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-6xl z-10">
        {/* Local */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-3">
          <p className="text-pink-300 text-center font-semibold mb-1">👤 You</p>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Stranger */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-3">
          <p className="text-emerald-300 text-center font-semibold mb-1">
            🎯 Stranger
          </p>
          {isConnected ? (
            <p className="text-center text-white text-sm mb-1">
              🎭 {strangerGender.toUpperCase()} | 🎂 {strangerAge}{" "}
              {strangerCountry && (
                <span className="ml-2">
                  🌍 {flagEmoji(strangerCountry)}
                </span>
              )}
            </p>
          ) : (
            <p className="text-center text-white/80 text-sm mb-1 animate-pulse">
              🔍 Searching Stranger for You…
            </p>
          )}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Chat + Emoji */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-xl p-4 shadow-xl z-10 relative">
        {showEmoji && (
          <div className="absolute bottom-24 right-4 z-50">
            <Picker data={data} onEmojiSelect={(e) => setNewMessage((prev) => prev + e.native)} theme="dark" />
          </div>
        )}
        <div className="h-44 overflow-y-auto mb-3 space-y-2">
          {chatMessages.map((m, i) => (
            <div
              key={i}
              className={`max-w-xs p-2 rounded-lg text-sm ${
                m.type === "me" ? "ml-auto bg-pink-500" : "bg-purple-500"
              } text-white`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="px-2 py-1 bg-white/20 rounded-full text-white border border-white/30 hover:bg-white/30"
          >
            😊
          </button>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 rounded-xl px-4 py-2 bg-white/20 text-white border border-white/30 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold"
          >
            ➤
          </button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4 mt-4 z-10">
        <button
          onClick={handleSkip}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg"
        >
          ⏭️ Skip
        </button>
        <button
          onClick={handleDisconnect}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow-lg"
        >
          ❌ Disconnect
        </button>
        <button
          onClick={toggleMic}
          className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20"
        >
          {micOn ? "🎤 Mute" : "🔇 Unmute"}
        </button>
        <button
          onClick={toggleCamera}
          className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20"
        >
          {cameraOn ? "📷 Cam Off" : "🚫 Cam On"}
        </button>
      </div>
    </div>
  );
}

export default VideoChat;

