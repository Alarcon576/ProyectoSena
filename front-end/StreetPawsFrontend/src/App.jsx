import { useState, useEffect } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Mascotas from "./components/mascotas/Mascotas";
import Feed from "./components/social/Feed";
import Perfil from "./components/profile/Perfil";
import PerfilPublico from "./components/profile/PerfilPublico";
import Explorar from "./components/explorar/Explorar";
import Adopciones from "./components/adopciones/Adopciones";

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
        setView("feed");
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setView("feed");
  };

  return (
    <div>
      {view === "login" && (
        <Login onSwitch={handleSwitch} onLogin={handleLogin} />
      )}

      {view === "register" && (
        <Register onSwitch={handleSwitch} />
      )}

      {view === "mascotas" && user?.rol === 2 && (
        <Mascotas onSwitch={handleSwitch} user={user} />
      )}

      {view === "feed" && (
        <Feed onSwitch={handleSwitch} user={user} />
      )}

      {view === "explorar" && (
        <Explorar onSwitch={handleSwitch} />
      )}

      {view === "adopciones" && (
        <Adopciones onSwitch={handleSwitch} user={user} />
      )}

      {view === "perfil" && (
        <Perfil onSwitch={handleSwitch} />
      )}

      {view === "perfilPublico" && selectedUserId && (
        <PerfilPublico onSwitch={handleSwitch} userId={selectedUserId} />
      )}
    </div>
  );
}

export default App;