import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './state/AppProviders';
import LoginPage from './pages/LoginPage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><MoviesPage /></PrivateRoute>} />
        <Route path="/movies/:id" element={<PrivateRoute><MovieDetailsPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
