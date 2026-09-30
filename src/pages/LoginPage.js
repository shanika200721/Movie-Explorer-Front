import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { apiErrorMessage } from '../api/client';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../state/AppProviders';

export default function LoginPage() {
  const { token, login, authNotice, clearAuthNotice } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (token) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate(location.state?.from || '/', { replace: true });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Login failed. Check your username and password.'));
    } finally { setLoading(false); }
  }

  return <AuthForm title="Welcome back" subtitle="Sign in to continue exploring movies." submitLabel="Sign in"
    alternateText="New here?" alternateLabel="Create an account" alternateTo="/register"
    form={form} setForm={setForm} error={error} notice={authNotice} loading={loading}
    onSubmit={(event) => { clearAuthNotice(); handleSubmit(event); }} />;
}
