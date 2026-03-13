import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, PlusCircle, Menu, X, LogIn, Network, LogOut, User, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home', icon: BookOpen },
  { to: '/browse', label: 'Browse Projects', icon: Search },
  { to: '/submit', label: 'Submit Project', icon: PlusCircle },
  { to: '/graph', label: 'Knowledge Graph', icon: Network },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check auth state
  useEffect(() => {
    const userStr = localStorage.getItem('innotrack_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      setUser(null);
    }
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem('innotrack_user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
            <img src="/logo.png" alt="Inno Track Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Inno<span className="text-gradient-accent">Track</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          {user?.role === 'Admin' && (
            <Link
              to="/institution/dashboard"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${location.pathname === '/institution/dashboard'
                ? 'bg-rose-500 text-white'
                : 'text-rose-500 hover:bg-rose-500/10'
                }`}
            >
              <Activity className="h-4 w-4" />
              Admin Dashboard
            </Link>
          )}
          {user?.role === 'Faculty' && (
            <Link
              to="/faculty/dashboard"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${location.pathname === '/faculty/dashboard'
                ? 'bg-indigo-500 text-white'
                : 'text-indigo-500 hover:bg-indigo-500/10'
                }`}
            >
              <Activity className="h-4 w-4" />
              Faculty Dashboard
            </Link>
          )}
        </div>

        {/* Auth controls (desktop) */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.name} <span className="text-xs opacity-70">({user.role})</span></span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t bg-card md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                      }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}

              {user?.role === 'Admin' && (
                <Link
                  to="/institution/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${location.pathname === '/institution/dashboard'
                    ? 'bg-rose-500 text-white'
                    : 'text-rose-500 hover:bg-rose-500/20 text-rose-500'
                    }`}
                >
                  <Activity className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}

              {user?.role === 'Faculty' && (
                <Link
                  to="/faculty/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${location.pathname === '/faculty/dashboard'
                    ? 'bg-indigo-500 text-white'
                    : 'text-indigo-500 hover:bg-indigo-500/20 text-indigo-500'
                    }`}
                >
                  <Activity className="h-4 w-4" />
                  Faculty Dashboard
                </Link>
              )}

              <div className="h-px bg-border my-2" />

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 text-sm text-foreground">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary border border-primary/20"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
