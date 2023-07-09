import "./App.css";
import Navbar from "./components/NavBar";
import { Routes, Route, useNavigate } from "react-router-dom";

import Landing from "./Pages/Landing";

function App() {
  return (
    <div
      className="App"
      // style={{
      //   minHeight: "100dvh",
      // }}
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
