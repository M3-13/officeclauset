import { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import ItemDetail from "./pages/ItemDetail";
import ItemForm from "./pages/ItemForm";
import Login from "./pages/Login";
import OutfitCreator from "./pages/OutfitCreator";
import OutfitDetail from "./pages/OutfitDetail";
import Outfits from "./pages/Outfits";
import Register from "./pages/Register";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/:id"
        element={
          <ProtectedRoute>
            <ItemDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/new"
        element={
          <ProtectedRoute>
            <ItemForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/:id/edit"
        element={
          <ProtectedRoute>
            <ItemForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/outfit-creator"
        element={
          <ProtectedRoute>
            <OutfitCreator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/outfits"
        element={
          <ProtectedRoute>
            <Outfits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/outfits/:id"
        element={
          <ProtectedRoute>
            <OutfitDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
