import { useState, useEffect } from "react";

const useAudio = (url) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying((prev) => !prev);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing, audio]);

  useEffect(() => {
    const handleEnded = () => setPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audio]);

  return [playing, toggle];
};

export default useAudio;
