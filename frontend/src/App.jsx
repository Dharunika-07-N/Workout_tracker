import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export default function App(){
  return (
    <BrowserRouter>
      <div style={{fontFamily:'Arial, sans-serif',padding:24}}>
        <h1>Workout Tracker (Frontend)</h1>
        <nav style={{marginBottom:12}}>
          <Link to="/">Home</Link> | <Link to="/forgot-password">Forgot Password</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
