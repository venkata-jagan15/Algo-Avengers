import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const ROLES = ['Student'];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Student',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/register', {
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to register. Server may be down.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-hero opacity-10 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl overflow-hidden shadow-md">
              <img src="/logo.png" alt="Inno Track Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              Inno<span className="text-gradient-accent">Track</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground font-display text-center">Create an account</h1>
          <p className="text-muted-foreground mt-2 text-center">Join the Inno Track community today</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-card">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-green-500" />
              <p className="text-lg font-semibold text-foreground">Registration successful!</p>
              <p className="text-muted-foreground text-sm">Redirecting you to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="block text-sm font-medium text-foreground">
                  Email address
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@innotrack.com"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label htmlFor="reg-role" className="block text-sm font-medium text-foreground">
                  Role
                </label>
                <select
                  id="reg-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        {/* Already have account */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
