import { useState, useEffect } from "react";

export default function useAudio(url) {
  const [audio] = useState(() => {
    const a = new Audio(url);
    a.loop = true;        // 🔁 Loop the music
    a.muted = false;      // 🔇 Set this to true only if autoplay fails
    return a;
  });

  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying((prev) => !prev);

  useEffect(() => {
    if (playing) {
      audio.play().catch((err) => {
        console.warn("Autoplay failed. Muting audio:", err);
        audio.muted = true;
        audio.play();
      });
    } else {
      audio.pause();
    }
  }, [playing]);

  useEffect(() => {
    const handleEnded = () => setPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  return [playing, toggle];
}
