import { useState } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Mascotas from "./components/mascotas/Mascotas";

function App() {
  const [view, setView] = useState("login");

  return (
    <div>
      {/* Pasamos setView como una prop llamada 'onSwitch' 
         para que los componentes internos puedan cambiar la vista 
      */}
      {view === "login" && <Login onSwitch={setView} />}
      {view === "register" && <Register onSwitch={setView} />}
      {view === "mascotas" && <Mascotas onSwitch={setView} />}
    </div>
  );
}

export default App;