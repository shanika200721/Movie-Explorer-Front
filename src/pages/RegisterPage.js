import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api, { apiErrorMessage } from '../api/client';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../state/AppProviders';

export default function RegisterPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (token) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data); navigate('/', { replace: true });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Account creation failed. Please try again.'));
    } finally { setLoading(false); }
  }

  return <AuthForm title="Create your account" subtitle="Your favorites stay private to this browser account."
    submitLabel="Create account" alternateText="Already registered?" alternateLabel="Sign in" alternateTo="/login"
    form={form} setForm={setForm} error={error} loading={loading} onSubmit={handleSubmit} />;
}
