import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAudio from "../hooks/useAudio";
import { Helmet } from "react-helmet";

function Home() {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const navigate = useNavigate();
  const [playing, toggle] = useAudio("/music.mp3");

  const handleStartChat = () => {
    if (!gender || !age) {
      alert("Please select gender and age group");
      return;
    }
    navigate("/searching", { state: { gender, age } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-blue-400 flex items-center justify-center p-4 font-inter relative">
      <Helmet>
        <title>🎥 RandomChat X - Talk to Strangers Instantly</title>
         <meta name="description" content="Start live video chat with strangers across the world. 100% anonymous. Filter by gender and age. Free and fun!" />
  <meta name="keywords" content="video chat, random chat, talk to strangers, live chat, anonymous chat, RandomChatX" />
        <meta property="og:title" content="RandomChat X" />
        <meta property="og:description" content="Live video chat with random strangers. Stylish, safe, and fun." />
        <meta property="og:type" content="website" />
<meta property="og:image" content="https://randomchatx.vercel.app/heart.png" />
<meta property="og:url" content="https://randomchatx.vercel.app/heart.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* 💖 Background Floating Hearts */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img src="/heart.png" alt="heart" className="absolute left-1/4 top-20 w-20 h-20 opacity-70 animate-floatHeart" />
        <img src="/heart.png" alt="heart" className="absolute right-1/4 bottom-10 w-16 h-16 opacity-70 animate-floatHeart" />
      </div>

      <motion.div
        className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl rounded-3xl p-8 max-w-md w-full animate-fadeInUp"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-center text-white mb-6 drop-shadow animate-bounce">
          💖 Random Video Chat
        </h1>

        {/* Gender Select */}
        <div className="mb-4 text-left">
          <label className="block mb-2 text-white font-medium">Your Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#1f1f2e]/70 text-white focus:outline-none border border-white/20 backdrop-blur-md appearance-none hover:ring-2 ring-pink-300 transition-all"
          >
            <option value="">-- 🚻 Select Your Gender --</option>
            <option value="male">👨 Male</option>
            <option value="female">👩 Female</option>
          </select>
        </div>

        {/* Age Select */}
        <div className="mb-6 text-left">
          <label className="block mb-2 text-white font-medium">Your Age</label>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#1f1f2e]/70 text-white focus:outline-none border border-white/20 backdrop-blur-md appearance-none hover:ring-2 ring-purple-300 transition-all"
          >
            <option value="">-- 🎂 Select Your Age --</option>
            <option value="18-25">🔞 18-25</option>
            <option value="26-35">🧑 26-35</option>
            <option value="36-50">🧔 36-50</option>
            <option value="50+">👴 50+</option>
          </select>
        </div>

        
        <motion.button
          onClick={handleStartChat}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition duration-300"
        >
          🚀 Start Chat
        </motion.button>
      </motion.div>

      {/* 🔇 Mute Button */}
      <button
        onClick={toggle}
        className="absolute top-4 right-4 text-white bg-black/40 rounded-full px-4 py-2 text-sm hover:bg-black/60 backdrop-blur"
      >
        {playing ? "🔊 Mute Music" : "🔇 Unmute"}
      </button>
    </div>
  );
}

<footer className="text-center text-white mt-10">
  <a href="/privacy" className="mx-2 underline hover:text-pink-400">Privacy</a>
  <a href="/terms" className="mx-2 underline hover:text-pink-400">Terms</a>
  <a href="/about" className="mx-2 underline hover:text-pink-400">About</a>
  <a href="/blog" className="mx-2 underline hover:text-pink-400">Blog</a>
</footer>

export default Home;

