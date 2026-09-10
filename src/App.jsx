import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateConfession from "./pages/CreateConfession";
import ConfessionDetails from "./pages/ConfessionDetails";
import AnonymousProfile from "./pages/AnonymousProfile";
import ConfessionDetail from "./pages/ConfessionDetail";

function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/profile"
            element={<AnonymousProfile />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/confess"
            element={<CreateConfession />}
          />

          <Route
            path="/confession/:id"
            element={<ConfessionDetails />}
          />

          <Route
              path="/confession/:id"
              element={<ConfessionDetail />}
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;