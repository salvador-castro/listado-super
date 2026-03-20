import { Routes, Route, NavLink } from "react-router-dom";
import ListPage from "./pages/ListPage";
import AddPage from "./pages/AddPage";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 SuperList</h1>
        <nav>
          <NavLink to="/" end>
            Mi Lista
          </NavLink>
          <NavLink to="/agregar">Agregar</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/agregar" element={<AddPage />} />
        </Routes>
      </main>
    </div>
  );
}
