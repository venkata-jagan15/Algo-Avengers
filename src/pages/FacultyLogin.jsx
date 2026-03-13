import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const FacultyLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email,
                password
            });

            if (response.data.role !== 'Faculty') {
                setError('Unauthorized: This portal is for Faculty members only.');
                setLoading(false);
                return;
            }

            localStorage.setItem('innotrack_user', JSON.stringify(response.data));
            navigate('/faculty/dashboard');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Failed to log in. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-hero opacity-10 -z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl -z-10" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-xl overflow-hidden shadow-md">
                            <img src="/logo.png" alt="Inno Track Logo" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-display text-2xl font-bold text-foreground">
                            Inno<span className="text-amber-500">Track</span>
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground font-display text-center">Faculty Portal</h1>
                    <p className="text-muted-foreground mt-2 text-center">Sign in to manage and review projects</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8 shadow-card border-t-4 border-t-amber-500">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-foreground">
                                Faculty Email address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="faculty@university.edu"
                                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber-600 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <LogIn className="h-4 w-4" />
                            )}
                            {loading ? 'Signing in…' : 'Faculty Sign In'}
                        </button>
                    </form>
                </div>

                {/* Links */}
                <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <p>
                        New faculty member?{' '}
                        <Link to="/faculty/register" className="font-semibold text-amber-500 hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FacultyLogin;
