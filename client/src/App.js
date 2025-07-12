import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VideoChat from "./pages/VideoChat";
import Searching from "./pages/Searching"; // ✅ Import searching screen

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/searching" element={<Searching />} /> {/* ✅ Add this line */}
        <Route path="/chat" element={<VideoChat />} />
        <Route path="/" element={<Home />} />
      
      </Routes>
    </Router>
  );
}

export default App;


