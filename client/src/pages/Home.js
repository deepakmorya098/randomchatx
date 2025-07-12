import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAudio from "../hooks/useAudio";
import { Helmet } from "react-helmet"; // ✅ SEO support

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
    navigate("/searching");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-blue-400 flex items-center justify-center p-4 font-inter relative">
      {/* ✅ SEO Tags */}
      <Helmet>
        <title>🎥 RandomChat X - Talk to Strangers Instantly</title>
        <meta name="description" content="Connect instantly with random people around the world! Enjoy live video chat with gender filters, romantic UI, and more." />
        <meta name="keywords" content="video chat, random chat, talk to strangers, omegle alternative, random video call, dating chat, stranger meet, girl video chat, girl chat online, girl chat video " />
        <meta property="og:title" content="RandomChat X" />
        <meta property="og:description" content="Live video chat with random strangers. Stylish, safe, and fun." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://yourdomain.com/thumbnail.jpg" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* 💖 Floating heart animation behind form box */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          src="/heart.png"
          alt="heart"
          className="absolute left-1/4 top-20 w-20 h-20 opacity-70 animate-floatHeart"
        />
        <img
          src="/heart.png"
          alt="heart"
          className="absolute right-1/4 bottom-10 w-16 h-16 opacity-70 animate-floatHeart"
        />
      </div>

      <motion.div
        className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl rounded-3xl p-8 max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-center text-white mb-6 drop-shadow">
          💖 Random Video Chat
        </h1>

        {/* Gender Select */}
        <div className="mb-4 text-left">
          <label className="block mb-2 text-white font-medium">Select Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#1f1f2e]/70 text-white placeholder-white focus:outline-none border border-white/20 backdrop-blur-md appearance-none"
          >
            <option value="">-- Choose Gender --</option>
            <option value="male">👨 Male</option>
            <option value="female">👩 Female</option>
            <option value="any">🔁 Any</option>
          </select>
        </div>

        {/* Age Select */}
        <div className="mb-6 text-left">
          <label className="block mb-2 text-white font-medium">Age Group</label>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#1f1f2e]/70 text-white placeholder-white focus:outline-none border border-white/20 backdrop-blur-md appearance-none"
          >
            <option value="">-- Choose Age --</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-50">36-50</option>
            <option value="50+">50+</option>
          </select>
        </div>

        <motion.button
          onClick={handleStartChat}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition"
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

export default Home;



