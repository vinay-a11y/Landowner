import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Dashboard from "@/pages/Dashboard"
import SpreadsheetView from "@/pages/SpreadsheetView"
import Login from "@/pages/login"
import ForgotPassword from "@/pages/ForgotPassword"

import "@/App.css"

/* =======================
   AUTH CHECK
======================= */
const isAuthenticated = () => {
  // 🔴 MUST match the key used during login
  return !!localStorage.getItem("token")
}

/* =======================
   PRIVATE ROUTE
======================= */
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

/* =======================
   APP ROUTER
======================= */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 🔐 Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/spreadsheet"
          element={
            <PrivateRoute>
              <SpreadsheetView />
            </PrivateRoute>
          }
        />

        {/* ❌ Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
