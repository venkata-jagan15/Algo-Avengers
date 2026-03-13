import { motion } from 'framer-motion';
import { Search, BookOpen, AlertTriangle, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { icon: BookOpen, value: '150+', label: 'Projects Archived' },
  { icon: AlertTriangle, value: '40+', label: 'Lessons Documented' },
  { icon: Lightbulb, value: '25+', label: 'Ideas for Continuation' },
];

const HeroSection = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative overflow-hidden bg-hero py-24 md:py-32">
      {/* Decorative shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-6xl">
            Don't Start From Zero.{' '}
            <span className="text-gradient-accent">Build on What Came Before.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/70">
            Discover past academic projects, learn from failures, and continue unfinished work. 
            A knowledge vault where every semester's experience lives on.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-xl overflow-hidden rounded-2xl bg-card shadow-hero"
        >
          <div className="flex flex-1 items-center gap-3 px-5">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, topics, technologies..."
              className="w-full bg-transparent py-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="m-2 rounded-xl bg-accent px-6 font-display font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-10 md:gap-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <stat.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="font-display text-2xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
