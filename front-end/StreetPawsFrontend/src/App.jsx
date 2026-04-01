import { useState, useEffect } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Mascotas from "./components/mascotas/Mascotas";
import Feed from "./components/social/Feed";
import Perfil from "./components/profile/perfil";

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const userData = decodeToken(token);

      if (userData) {
        setUser(userData);

       
        if (userData.rol === 2) {
          setView("mascotas");
        } 
      
        else {
          setView("feed");
        }
      }
    }
  }, []);

  // 🚀 Login exitoso
  const handleLogin = (userData) => {
    setUser(userData);

    if (userData.rol === 2) {
      setView("mascotas");
    } else {
      setView("feed");
    }
  };

  return (
    <div>
      {/* 🔐 LOGIN */}
      {view === "login" && (
        <Login onSwitch={setView} onLogin={handleLogin} />
      )}

      {/* 📝 REGISTER */}
      {view === "register" && (
        <Register onSwitch={setView} />
      )}

      {/* 👑 ADMIN */}
      {view === "mascotas" && (
        <Mascotas onSwitch={setView} user={user} />
      )}

      {/* 👤 FEED */}
      {view === "feed" && (
        <Feed onSwitch={setView} />
      )}

      {/* 👤 PERFIL */}
      {view === "perfil" && (
        <Perfil onSwitch={setView} />
      )}
    </div>
  );
}

export default App;