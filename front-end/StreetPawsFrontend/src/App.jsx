import { useState, useEffect } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Mascotas from "./components/mascotas/Mascotas";
import Feed from "./components/social/Feed";
import Perfil from "./components/profile/perfil";
import PerfilPublico from "./components/profile/PerfilPublico";

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleSwitch = (viewName, userId = null) => {
    setSelectedUserId(userId); 
    setView(viewName);
  };

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
        } else {
          setView("feed");
        }
      }
    }
  }, []);

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
      {/*  LOGIN */}
      {view === "login" && (
        <Login
          onSwitch={handleSwitch}
          onLogin={handleLogin}
        />
      )}

      {/*  REGISTER */}
      {view === "register" && (
        <Register onSwitch={handleSwitch} />
      )}

      {/*  ADMIN */}
      {view === "mascotas" && (
        <Mascotas
          onSwitch={handleSwitch}
          user={user}
        />
      )}

      {/*  FEED */}
      {view === "feed" && (
        <Feed onSwitch={handleSwitch} />
      )}

      {/*  MI PERFIL */}
      {view === "perfil" && (
        <Perfil onSwitch={handleSwitch} />
      )}

      {/*  PERFIL PUBLICO */}
      {view === "perfilPublico" && selectedUserId && (
        <PerfilPublico
          onSwitch={handleSwitch}
          userId={selectedUserId}
        />
      )}
    </div>
  );
}

export default App;