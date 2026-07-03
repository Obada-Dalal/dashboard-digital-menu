import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Ads from "./pages/Ads";
import Login from "./pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token") // ✨ تحقق مباشر
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  // ✨ دالة تسجيل الدخول - تمرر لـ Login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return <div className="app-loading">جاري التحميل...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* صفحة تسجيل الدخول */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/admin-panel/products" replace />
            ) : (
              <Login onLoginSuccess={handleLogin} />
            )
          }
        />

        {/* لوحة التحكم */}
        <Route
          path="/admin-panel"
          element={
            isAuthenticated ? <DashboardLayout /> : <Navigate to="/" replace />
          }
        >
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="ads" element={<Ads />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
