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
import Noticias from "./components/noticias/Noticias";

/* Vistas que requieren sesión activa */
const VISTAS_PROTEGIDAS = [
  "feed",
  "perfil",
  "perfilPublico",
  "mascotas",
  "explorar",
  "adopciones",
  "configuracion",
  "noticias",
];

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const tokenValido = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const decoded = decodeToken(token);
    if (!decoded) return false;
    /* Verificar expiración si el token la incluye */
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return false;
    }
    return true;
  };

  /* ── Cambio de vista + push al historial del navegador ── */
  const handleSwitch = (viewName, userId = null) => {
    /* Si cierra sesión, limpiar historial para que atrás no vuelva a una vista protegida */
    if (viewName === "login") {
      setSelectedUserId(null);
      setUser(null);
      setView("login");
      window.history.replaceState(
        { view: "login", userId: null },
        "",
        "#login",
      );
      return;
    }

    /* Si intenta abrir el perfil público de sí mismo → redirigir a su propio perfil */
    if (viewName === "perfilPublico" && userId && user) {
      const miId = user.id || user.id_usuario;
      if (String(userId) === String(miId)) {
        setSelectedUserId(null);
        setView("perfil");
        window.history.pushState(
          { view: "perfil", userId: null },
          "",
          "#perfil",
        );
        return;
      }
    }

    setSelectedUserId(userId);
    setView(viewName);
    window.history.pushState({ view: viewName, userId }, "", `#${viewName}`);
  };

  /* ── Escuchar el botón atrás / gesto del celular ── */
  useEffect(() => {
    const onPopState = (e) => {
      const st = e.state;
      const vistaDestino = st?.view;

      /* Si la vista destino requiere sesión y no hay token válido → login */
      if (
        vistaDestino &&
        VISTAS_PROTEGIDAS.includes(vistaDestino) &&
        !tokenValido()
      ) {
        setSelectedUserId(null);
        setUser(null);
        setView("login");
        window.history.replaceState(
          { view: "login", userId: null },
          "",
          "#login",
        );
        return;
      }

      if (st && st.view) {
        setSelectedUserId(st.userId || null);
        setView(st.view);
      } else {
        setView(tokenValido() ? "feed" : "login");
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
    /* Token ausente o inválido: limpiar por si acaso y mostrar login */
    localStorage.removeItem("token");
    window.history.replaceState({ view: "login" }, "", "#login");
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setView("feed");
    window.history.pushState({ view: "feed" }, "", "#feed");
  };

  return (
    <div className="app-root">
      {view === "login" && (
        <Login key="login" onSwitch={handleSwitch} onLogin={handleLogin} />
      )}
      {view === "register" && (
        <Register key="register" onSwitch={handleSwitch} />
      )}
      {view === "mascotas" && user?.rol === 2 && (
        <Mascotas key="mascotas" onSwitch={handleSwitch} user={user} />
      )}
      {view === "feed" && (
        <Feed key="feed" onSwitch={handleSwitch} user={user} />
      )}
      {view === "explorar" && (
        <Explorar key="explorar" onSwitch={handleSwitch} />
      )}
      {view === "adopciones" && (
        <Adopciones key="adopciones" onSwitch={handleSwitch} user={user} />
      )}
      {view === "noticias" && (
        <Noticias key="noticias" onSwitch={handleSwitch} />
      )}
      {view === "perfil" && <Perfil key="perfil" onSwitch={handleSwitch} />}
      {view === "configuracion" && (
        <Configuracion
          key="configuracion"
          onSwitch={handleSwitch}
          user={user}
        />
      )}
      {view === "perfilPublico" && selectedUserId && (
        <PerfilPublico
          key={`perfilPublico-${selectedUserId}`}
          onSwitch={handleSwitch}
          userId={selectedUserId}
        />
      )}
    </div>
  );
}

export default App;
