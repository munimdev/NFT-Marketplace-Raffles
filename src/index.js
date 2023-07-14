import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import WalletContext from "./context/WalletContext";
import CartState from "./context/Cart/CartState";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <CartState>
      <WalletContext>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
          pauseOnHover
          theme="dark"
        />
      </WalletContext>
    </CartState>
  </BrowserRouter>
);
