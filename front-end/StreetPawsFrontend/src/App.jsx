import { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Mascotas from "./components/mascotas/Mascotas";
import Feed from "./components/social/Feed";
import Perfil from "./components/profile/perfil";
import PerfilPublico from "./components/profile/PerfilPublico";
import Explorar from "./components/explorar/Explorar";
import Adopciones from "./components/adopciones/Adopciones";
import Configuracion from "./components/configuracion/Configuracion";

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const decodeToken = (token) => {
    try { return JSON.parse(atob(token.split(".")[1])); }
    catch { return null; }
  };

  /* ── Cambio de vista + push al historial del navegador ── */
  const handleSwitch = (viewName, userId = null) => {
    setSelectedUserId(userId);
    setView(viewName);
    // Empuja un estado al historial para que el botón "atrás" funcione
    window.history.pushState({ view: viewName, userId }, "", `#${viewName}`);
  };

  /* ── Escuchar el botón atrás del navegador / gesto del celular ── */
  useEffect(() => {
    const onPopState = (e) => {
      const st = e.state;
      if (st && st.view) {
        setSelectedUserId(st.userId || null);
        setView(st.view);
      } else {
        // Sin estado previo: vuelve al feed si hay sesión, si no al login
        const token = localStorage.getItem("token");
        setView(token ? "feed" : "login");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  /* ── Sesión persistente al cargar ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = decodeToken(token);
      if (userData) {
        setUser(userData);
        setView("feed");
        window.history.replaceState({ view: "feed" }, "", "#feed");
        return;
      }
    }
    window.history.replaceState({ view: "login" }, "", "#login");
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setView("feed");
    window.history.pushState({ view: "feed" }, "", "#feed");
  };

  return (
    <div className="app-root">
      {view === "login" && <Login onSwitch={handleSwitch} onLogin={handleLogin} />}

      {view === "register" && <Register onSwitch={handleSwitch} />}

      {view === "mascotas" && user?.rol === 2 && (
        <Mascotas onSwitch={handleSwitch} user={user} />
      )}

      {view === "feed" && <Feed onSwitch={handleSwitch} user={user} />}

      {view === "explorar" && <Explorar onSwitch={handleSwitch} />}

      {view === "adopciones" && <Adopciones onSwitch={handleSwitch} user={user} />}

      {view === "perfil" && <Perfil onSwitch={handleSwitch} />}

      {view === "configuracion" && <Configuracion onSwitch={handleSwitch} user={user} />}

      {view === "perfilPublico" && selectedUserId && (
        <PerfilPublico onSwitch={handleSwitch} userId={selectedUserId} />
      )}
    </div>
  );
}

export default App;