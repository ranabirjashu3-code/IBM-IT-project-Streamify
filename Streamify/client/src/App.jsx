import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Player from "./pages/Player";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import Anime from "./pages/Anime";
import Watchlist from "./pages/Watchlist";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./toast.css";

function App() {
  return (
    <BrowserRouter>
     <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/movies" element={<Movies/>}/>
        <Route path="/tv" element={<TVShows />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/player" element={<Player/>}/>
      </Routes>
    </BrowserRouter>

  );
};
export default App
