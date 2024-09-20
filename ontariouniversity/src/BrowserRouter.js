import React from 'react'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Register from "./components/Register"
import Login from "./components/Login"
import Home from "./components/Home"
import "./App.css"


export default function BrowserRouter() {
  return (
    <Router>
      <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
       </Routes>
    </Router>
  )
}