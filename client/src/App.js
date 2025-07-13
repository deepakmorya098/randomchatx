import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VideoChat from "./pages/VideoChat";
import Searching from "./pages/Searching"; // ✅ Import searching screen
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Blog from './pages/Blog';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/searching" element={<Searching />} /> {/* ✅ Add this line */}
        <Route path="/chat" element={<VideoChat />} />
        <Route path="/" element={<Home />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      </Routes>
    </Router>
  );
}

export default App;


