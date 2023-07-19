import "./App.css";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import AdminDashboard from "./Pages/Admin";
import { Routes, Route } from "react-router-dom";

import Landing from "./Pages/Landing";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
