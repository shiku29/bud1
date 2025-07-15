import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./auth/Login"; // adjust path as needed
import Products from "./pages/Products";
import EditProduct from "./pages/EditProduct"; // Import EditProduct
import Welcome from "./pages/Welcome"; // Import Welcome
import { auth } from "./auth/firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome user={user} />} />
        <Route path="/products" element={<Products user={user} />} />
        <Route path="/products/edit/:id" element={<EditProduct user={user} />} /> {/* Add this route */}
      </Routes>
    </div>
  );
}

export default App;
