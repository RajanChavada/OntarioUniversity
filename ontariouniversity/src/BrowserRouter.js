import React from 'react'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Register from "./components/Register"
import Login from "./components/Login"
import Home from "./components/Main"

import "./App.css"


export default function BrowserRouter() {
  return (
    <Router>
      <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
       </Routes>
    </Router>
  )
}