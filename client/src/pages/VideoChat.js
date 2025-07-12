import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet"; // ✅ Add this



const socket = io("http://localhost:5000");

function VideoChat() {
  const location            = useLocation();
  const localVideoRef       = useRef(null);
  const remoteVideoRef      = useRef(null);
  const peerRef             = useRef(null);
  const localStreamRef      = useRef(null);

  /* ────────── UI states ────────── */
  const [showMatched,      setShowMatched]      = useState(false);
  const [strangerGender,   setStrangerGender]   = useState("");
  const [strangerCountry,  setStrangerCountry]  = useState("");

  /* chat */
  const [chatMessages,     setChatMessages]     = useState([]);
  const [newMessage,       setNewMessage]       = useState("");

  /* mic / camera toggles */
  const [micOn,            setMicOn]            = useState(true);
  const [cameraOn,         setCameraOn]         = useState(true);

  /* stop landing‑page music */
  useEffect(() => {
    if (location.state?.stopMusic) location.state.stopMusic();
  }, [location.state]);

  /* ────────── WebRTC + Socket setup ────────── */
  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      socket.emit("join", { gender: "male" });

      socket.on("matched", async ({ partnerId, gender, country }) => {
        setStrangerGender(gender);
        setStrangerCountry(country);

        createPeer();
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socket.emit("offer", { offer, to: partnerId });
      });

      socket.on("offer", async ({ offer, from }) => {
        createPeer();
        await peerRef.current.setRemoteDescription(offer);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from });
      });

      socket.on("answer", ({ answer }) =>
        peerRef.current?.setRemoteDescription(answer)
      );

      socket.on("ice-candidate", ({ candidate }) =>
        peerRef.current?.addIceCandidate(candidate)
      );

      /* incoming chat */
      socket.on("chat-message", (msg) =>
        setChatMessages((prev) => [...prev, { type: "stranger", text: msg }])
      );
    })();

    return () => {
      socket.disconnect();
      peerRef.current?.close();
    };
  }, []);

  /* helpers */
  function createPeer() {
    if (peerRef.current) return;
    peerRef.current = new RTCPeerConnection();

    localStreamRef.current.getTracks().forEach((t) =>
      peerRef.current.addTrack(t, localStreamRef.current)
    );

    peerRef.current.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      setShowMatched(true);
      setTimeout(() => setShowMatched(false), 2000);
    };

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", { candidate: e.candidate });
    };
  }

  /* chat send */
  function handleSend() {
    if (!newMessage.trim()) return;
    socket.emit("chat-message", newMessage);
    setChatMessages((prev) => [...prev, { type: "me", text: newMessage }]);
    setNewMessage("");
  }

  /* mic toggle */
  function toggleMic() {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setMicOn(t.enabled);
    }
  }
  /* camera toggle */
  function toggleCamera() {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setCameraOn(t.enabled);
    }
  }

  /* skip / disconnect */
  function handleSkip() {
    peerRef.current?.close();
    peerRef.current = null;
    setChatMessages([]);
    socket.emit("join", { gender: "male" });
  }
  function handleDisconnect() {
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    socket.disconnect();
    window.location.href = "/";
  }

  const flagEmoji = (c) =>
    c ? String.fromCodePoint(...c.toUpperCase().split("").map((x) => 127397 + x.charCodeAt())) : "";

  /* ────────── JSX ────────── */
  return (
    <div className="relative min-h-screen flex flex-col items-center bg-gradient-to-br from-[#320041] via-[#711C91] to-[#FF4E8D] p-6 space-y-6 overflow-hidden font-inter">
       
        {/* ✅ SEO Helmet Meta Tags */}
        <Helmet>
      <title>Live Video Chat - RandomChat X</title>
      <meta name="description" content="You're now talking to a stranger! Live video chat with camera, mic, and chat support." />
    </Helmet>

    
      {/* blurred circles */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse"/>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-25 animate-pulse"/>
      </div>

      {/* header */}
      <motion.h1
        className="text-white text-3xl sm:text-4xl font-bold drop-shadow"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        🌀 RandomChat <span className="text-pink-400">X</span>
      </motion.h1>

      {/* matched popup */}
      {showMatched && (
        <div className="absolute top-16 z-50 bg-emerald-500/90 text-white font-bold px-6 py-3 rounded-full shadow-lg animate-bounce">
          ✨ Stranger Matched!
        </div>
      )}

      {/* videos */}
      <motion.div
        className="grid w-full max-w-6xl gap-6 sm:grid-cols-2 items-center z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* you */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-3">
          <p className="text-pink-300 mb-2 font-semibold text-center">👤 You</p>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <video ref={localVideoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted/>
          </div>
        </div>
        {/* stranger */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-3">
          <p className="text-emerald-300 mb-1 font-semibold text-center">🎯 Stranger</p>
          {strangerGender && (
            <p className="text-center text-white text-sm mb-1">
              🎭 {strangerGender.toUpperCase()} {strangerCountry && <span className="ml-2">🌍 {flagEmoji(strangerCountry)}</span>}
            </p>
          )}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <video ref={remoteVideoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline />
          </div>
        </div>
      </motion.div>

      {/* chat box */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-xl p-4 shadow-xl z-10">
        <div className="h-44 overflow-y-auto mb-3 space-y-2">
          {chatMessages.map((m, i) => (
            <div key={i} className={`max-w-xs p-2 rounded-lg text-sm ${m.type === "me" ? "ml-auto bg-pink-500" : "bg-purple-500"} text-white`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl px-4 py-2 bg-white/20 text-white border border-white/30 focus:outline-none"
          />
          <button onClick={handleSend} className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold">
            ➤
          </button>
        </div>
      </div>

      {/* controls */}
      <motion.div className="flex flex-wrap gap-4 sm:gap-6 mt-4 z-10">
        <button onClick={handleSkip} className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg">
          ⏭️ Skip
        </button>
        <button onClick={handleDisconnect} className="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow-lg">
          ❌ Disconnect
        </button>
        <button onClick={toggleMic} className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20">
          {micOn ? "🎤 Mute Mic" : "🔇 Unmute Mic"}
        </button>
        <button onClick={toggleCamera} className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20">
          {cameraOn ? "📷 Turn Off Cam" : "🚫 Turn On Cam"}
        </button>
      </motion.div>
    </div>
  );
}

export default VideoChat;
