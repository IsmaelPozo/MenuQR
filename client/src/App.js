import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import MenuManagement from "./pages/MenuManagement"
import TableManagement from "./pages/TableManagement"
import Kitchen from "./pages/Kitchen"
import CustomerMenu from "./pages/CustomerMenu"
import ForgotPassword from "./pages/ForgotPassword"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/menu/:qrCode" element={<CustomerMenu />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/menu-management"
                element={
                  <ProtectedRoute>
                    <MenuManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tables"
                element={
                  <ProtectedRoute>
                    <TableManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute>
                    <Kitchen />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
