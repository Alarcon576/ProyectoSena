import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [view, setView] = useState("login");

  return (
    <div>
      <h1>StreetPaws</h1>

      {view === "login" ? <Login /> : <Register />}

      <button onClick={() => setView("login")}>
        Ir a Login
      </button>

      <button onClick={() => setView("register")}>
        Ir a Registro
      </button>
    </div>
  );
}

export default App;