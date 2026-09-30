import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StockDetails from "./pages/StockDetails";
import Prediction from "./pages/Prediction";
import Portfolio from "./pages/Portfolio";
import Stocks from "./pages/Stocks";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/stocks" element={<Stocks />} />

      <Route path="/stock/:symbol" element={<StockDetails />} />

      <Route path="/prediction" element={<Prediction />} />

      <Route path="/portfolio" element={<Portfolio />} />

      <Route
        path="*"
        element={<Navigate to="/dashboard" />}
      />

    </Routes>
  );
}

export default App;