import { useState } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Mascotas from "./components/mascotas/Mascotas";

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);

  // 👉 Cuando el usuario inicia sesión
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