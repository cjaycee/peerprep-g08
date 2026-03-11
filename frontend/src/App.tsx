import Login from "./pages/Login.tsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { JSX } from "react";
import Register from "./pages/Register.tsx";
import AdminUpgrade from "./pages/AdminUpgrade.tsx";
import GenerateOTP from "./pages/GenerateOTP.tsx";
import { Home } from "./pages/Home.tsx";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/admin-upgrade"
          element={
            <ProtectedRoute>
              <AdminUpgrade />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate-otp"
          element={
            <ProtectedRoute>
              <GenerateOTP />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
