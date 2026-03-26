import { useState, useEffect } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Mascotas from "./components/mascotas/Mascotas";

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  // 🔐 Mantener sesión
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = decodeToken(token);
      if (userData) {
        setUser(userData);
        setView("mascotas");
      }
    }
  }, []);

  // 🚀 Login exitoso
  const handleLogin = (userData) => {
    setUser(userData);
    setView("mascotas");
  };

  return (
    <div>
      {view === "login" && (
        <Login onSwitch={setView} onLogin={handleLogin} />
      )}

      {view === "register" && (
        <Register onSwitch={setView} />
      )}

      {view === "mascotas" && (
        <Mascotas onSwitch={setView} user={user} />
      )}
    </div>
  );
}

export default App;