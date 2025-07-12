import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";



function Searching() {
  const navigate = useNavigate();

  useEffect(() => {
    // 3 seconds ke baad chat screen par le jao
    const timer = setTimeout(() => {
      navigate("/chat"); // ✅ Must match the route path of VideoChat
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#320041] via-[#711C91] to-[#FF4E8D] text-white font-inter overflow-hidden relative p-4">
      <Helmet>
        <title>Searching for a Match – RandomChat X</title>
        <meta name="description" content="Finding a random stranger for you. Please wait while we connect you to someone exciting!" />
      </Helmet>
     🌀 RandomChatX
      {/* 💫 Blurred glowing background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-pink-400 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-25 animate-pulse" />
      </div>

      {/* 🔍 Loading Text + Spinner */}
      <motion.div
        className="z-10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">🔍 Searching for a match...</h1>
        
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-pink-500 rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute inset-2 border-4 border-purple-400 rounded-full animate-spin-slow border-b-transparent"></div>
        </div>

        <p className="mt-6 text-lg text-white/80">Looking for your perfect stranger 💘</p>
      </motion.div>
    </div>
  );
}

export default Searching;
